import { useState, useRef, useEffect, useCallback } from 'react';
import { useAppContext } from '@/lib/AppContext';
import { streamGeminiResponseWithRetry, buildSystemPrompt, isRateLimitError, isAuthError, GeminiChatMessage } from '@/lib/gemini';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Terminal, AlertTriangle, Settings, RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocation } from 'wouter';

type ChatStatus = 'idle' | 'sending' | 'retrying' | 'cooldown';

const COOLDOWN_SECONDS = 30;

export default function Chat() {
  const { activeMode, messages, addMessage, updateLastMessage, settings } = useAppContext();
  const [input, setInput] = useState('');
  const [chatStatus, setChatStatus] = useState<ChatStatus>('idle');
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [retryTotal, setRetryTotal] = useState(0);
  const [retryDelaySecs, setRetryDelaySecs] = useState(0);
  const [retryCountdown, setRetryCountdown] = useState(0);
  const [cooldownSecs, setCooldownSecs] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef(false);
  const cooldownStartedRef = useRef(false);
  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [, setLocation] = useLocation();

  const isBusy = chatStatus !== 'idle';
  const isBlocked = chatStatus === 'cooldown';

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatStatus]);

  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
      if (retryTimerRef.current) clearInterval(retryTimerRef.current);
    };
  }, []);

  const startCooldown = useCallback(() => {
    setCooldownSecs(COOLDOWN_SECONDS);
    setChatStatus('cooldown');
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    cooldownTimerRef.current = setInterval(() => {
      setCooldownSecs(prev => {
        if (prev <= 1) {
          clearInterval(cooldownTimerRef.current!);
          setChatStatus('idle');
          setError(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const tickRetryCountdown = useCallback((delayMs: number) => {
    if (retryTimerRef.current) clearInterval(retryTimerRef.current);
    const total = Math.ceil(delayMs / 1000);
    setRetryCountdown(total);
    retryTimerRef.current = setInterval(() => {
      setRetryCountdown(prev => {
        if (prev <= 1) {
          clearInterval(retryTimerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const buildHistory = useCallback((): GeminiChatMessage[] => {
    return messages
      .filter(m => m.id !== 'welcome')
      .map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));
  }, [messages]);

  const handleSend = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    const userText = input.trim();
    if (!userText || isBusy || isBlocked) return;

    setInput('');
    setError(null);
    abortRef.current = false;
    cooldownStartedRef.current = false;

    addMessage({
      id: Date.now().toString(),
      text: userText,
      sender: 'user',
      timestamp: new Date(),
    });

    setChatStatus('sending');

    if (!settings.geminiApiKey) {
      setTimeout(() => {
        setChatStatus('idle');
        addMessage({
          id: (Date.now() + 1).toString(),
          text: 'No API key configured. Navigate to Settings and enter your Gemini API key to enable real AI responses.',
          sender: 'ykai',
          timestamp: new Date(),
        });
      }, 800);
      return;
    }

    const historyBeforeUserMsg = buildHistory();
    const systemPrompt = buildSystemPrompt(activeMode.id, settings.personality);
    let accumulated = '';

    addMessage({
      id: (Date.now() + 1).toString(),
      text: '',
      sender: 'ykai',
      timestamp: new Date(),
    });

    try {
      const stream = streamGeminiResponseWithRetry(
        settings.geminiApiKey,
        historyBeforeUserMsg,
        userText,
        systemPrompt,
        (attempt, total, delayMs) => {
          setRetryAttempt(attempt);
          setRetryTotal(total);
          setRetryDelaySecs(Math.ceil(delayMs / 1000));
          setChatStatus('retrying');
          tickRetryCountdown(delayMs);
        }
      );

      for await (const chunk of stream) {
        if (abortRef.current) break;
        if (chatStatus !== 'sending') setChatStatus('sending');
        accumulated += chunk;
        updateLastMessage(accumulated);
      }

      if (!accumulated.trim()) {
        updateLastMessage('No response received. Please try again.');
      }
    } catch (err: unknown) {
      if (isRateLimitError(err)) {
        setError('Rate limit exhausted after retries. Neural systems cooling down...');
        updateLastMessage('Rate limit reached. Neural core cooling down — please wait before sending another message.');
        cooldownStartedRef.current = true;
        startCooldown();
        return;
      } else if (isAuthError(err)) {
        setError('Invalid API key. Check your Gemini API key in Settings.');
        updateLastMessage('Authentication failed. Please verify your API key in Settings.');
      } else {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        setError(msg);
        updateLastMessage(`Neural error: ${msg}`);
      }
    } finally {
      if (!cooldownStartedRef.current) setChatStatus('idle');
    }
  }, [input, isBusy, isBlocked, settings.geminiApiKey, settings.personality, activeMode, addMessage, updateLastMessage, buildHistory, tickRetryCountdown, startCooldown]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const statusLabel = () => {
    if (chatStatus === 'retrying') return `Retry ${retryAttempt}/${retryTotal} — waiting ${retryCountdown}s...`;
    if (chatStatus === 'cooldown') return `Neural cooling... ${cooldownSecs}s`;
    if (chatStatus === 'sending') return 'YKAI is processing...';
    return settings.geminiApiKey ? `Message ${activeMode.name}...` : 'Demo mode — configure API key in Settings...';
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-4xl mx-auto">

      {/* Header */}
      <div className="glass-panel p-4 rounded-t-xl border-b-0 flex items-center justify-between mb-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center neon-border">
            <Terminal className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display font-semibold tracking-wide text-primary neon-text">{activeMode.name}</h2>
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${
                chatStatus === 'cooldown' ? 'bg-orange-400 animate-pulse' :
                chatStatus === 'retrying' ? 'bg-yellow-400 animate-pulse' :
                settings.geminiApiKey ? 'bg-primary animate-pulse' : 'bg-yellow-500'
              }`} />
              <span className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
                {chatStatus === 'cooldown' ? 'Rate Limited — Cooling' :
                 chatStatus === 'retrying' ? 'Retrying Connection' :
                 settings.geminiApiKey ? 'Gemini 2.0 Flash — Live' : 'No API Key — Demo Mode'}
              </span>
            </div>
          </div>
        </div>
        {!settings.geminiApiKey && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/settings')}
            className="text-yellow-400 border border-yellow-400/30 hover:bg-yellow-400/10 font-mono text-xs uppercase tracking-wider gap-1.5"
            data-testid="button-configure-api"
          >
            <Settings className="w-3.5 h-3.5" />
            Configure API
          </Button>
        )}
      </div>

      {/* Status Banners */}
      <AnimatePresence>
        {/* Retry Banner */}
        {chatStatus === 'retrying' && (
          <motion.div
            key="retry-banner"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-x border-yellow-500/30 bg-yellow-900/20 px-4 py-2.5 flex items-center gap-3"
            data-testid="banner-retrying"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
            >
              <RefreshCw className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
            </motion.div>
            <span className="text-xs font-mono text-yellow-300 uppercase tracking-widest">
              Rate limit detected — retry {retryAttempt}/{retryTotal}
            </span>
            <div className="ml-auto flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-yellow-400/70" />
              <span className="text-xs font-mono text-yellow-400 tabular-nums">{retryCountdown}s</span>
            </div>
            {/* Countdown progress bar */}
            <div className="absolute bottom-0 left-0 h-[2px] bg-yellow-500/20 w-full">
              <motion.div
                className="h-full bg-yellow-400"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: retryDelaySecs, ease: 'linear' }}
              />
            </div>
          </motion.div>
        )}

        {/* Cooldown Banner */}
        {chatStatus === 'cooldown' && (
          <motion.div
            key="cooldown-banner"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="relative border-x border-orange-500/30 bg-orange-900/20 px-4 py-2.5 flex items-center gap-3 overflow-hidden"
            data-testid="banner-cooldown"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            </motion.div>
            <span className="text-xs font-mono text-orange-300 uppercase tracking-widest">
              Neural systems overloaded — rate limit exhausted
            </span>
            <div className="ml-auto flex items-center gap-1.5 shrink-0">
              <Clock className="w-3 h-3 text-orange-400/70" />
              <span className="text-xs font-mono text-orange-400 tabular-nums w-6 text-right">{cooldownSecs}s</span>
            </div>
            {/* Draining progress bar */}
            <div className="absolute bottom-0 left-0 h-[2px] bg-orange-500/20 w-full">
              <motion.div
                className="h-full bg-orange-400"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: COOLDOWN_SECONDS, ease: 'linear' }}
              />
            </div>
          </motion.div>
        )}

        {/* Error Banner */}
        {error && chatStatus === 'idle' && (
          <motion.div
            key="error-banner"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-900/30 border-x border-red-500/30 px-4 py-2 flex items-center gap-2"
            data-testid="banner-error"
          >
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="text-xs font-mono text-red-300">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-300 text-xs font-mono"
              data-testid="button-dismiss-error"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Area */}
      <div className="flex-1 glass-panel border-y-0 overflow-y-auto p-4 sm:p-6 space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-[10px] font-mono text-muted-foreground">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-xs font-display tracking-widest uppercase text-primary/70">
                  {msg.sender === 'user' ? 'GUEST' : 'YKAI'}
                </span>
              </div>
              <div
                className={`max-w-[85%] sm:max-w-[80%] p-4 rounded-xl font-mono text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? 'bg-primary/20 border border-primary/30 text-primary-foreground ml-4'
                    : 'bg-secondary border border-white/5 text-foreground mr-4'
                }`}
                style={msg.sender === 'user' ? { boxShadow: 'inset 0 0 15px rgba(0,255,255,0.05)' } : {}}
              >
                {msg.text || (
                  <span className="inline-flex items-center gap-1.5">
                    <motion.span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} />
                    <motion.span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} />
                    <motion.span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} />
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="glass-panel p-4 rounded-b-xl border-t-0">
        <form onSubmit={handleSend} className="relative flex items-center">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={statusLabel()}
            disabled={isBusy || isBlocked}
            className={`w-full bg-background/50 text-foreground h-14 pl-4 pr-16 rounded-lg font-mono text-sm transition-all duration-300 neon-border-focus disabled:opacity-60 ${
              chatStatus === 'cooldown'
                ? 'border-orange-500/40 focus-visible:ring-orange-500'
                : chatStatus === 'retrying'
                ? 'border-yellow-500/40 focus-visible:ring-yellow-500'
                : 'border-white/10 focus-visible:ring-primary focus-visible:border-primary'
            }`}
            data-testid="input-chat"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isBusy || isBlocked}
            className={`absolute right-2 border h-10 w-10 transition-all duration-200 ${
              chatStatus === 'cooldown'
                ? 'bg-orange-500/10 text-orange-400 border-orange-500/30 cursor-not-allowed'
                : chatStatus === 'retrying'
                ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30 cursor-wait'
                : 'bg-primary/20 hover:bg-primary/40 text-primary border-primary/50 neon-border'
            }`}
            data-testid="button-send-chat"
          >
            {chatStatus === 'cooldown' ? (
              <span className="text-[10px] font-mono font-bold tabular-nums">{cooldownSecs}</span>
            ) : chatStatus === 'retrying' ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                <RefreshCw className="w-4 h-4" />
              </motion.div>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
        <p className="text-[10px] font-mono text-muted-foreground/40 mt-2 text-center uppercase tracking-widest">
          {chatStatus === 'cooldown'
            ? `Neural cooling — resuming in ${cooldownSecs}s`
            : chatStatus === 'retrying'
            ? `Auto-retry ${retryAttempt}/${retryTotal} — exponential backoff active`
            : settings.geminiApiKey
            ? 'Gemini 2.0 Flash · End-to-end encrypted'
            : 'Add Gemini API key in Settings for live AI'}
        </p>
      </div>

    </div>
  );
}
