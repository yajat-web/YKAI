import { useState, useRef, useEffect, useCallback } from 'react';
import { useAppContext } from '@/lib/AppContext';
import { streamGeminiResponse, buildSystemPrompt, GeminiChatMessage } from '@/lib/gemini';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Terminal, AlertTriangle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocation } from 'wouter';

export default function Chat() {
  const { activeMode, messages, addMessage, updateLastMessage, settings } = useAppContext();
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

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
    if (!userText || isStreaming) return;

    setInput('');
    setError(null);

    addMessage({
      id: Date.now().toString(),
      text: userText,
      sender: 'user',
      timestamp: new Date(),
    });

    if (!settings.geminiApiKey) {
      addMessage({
        id: (Date.now() + 1).toString(),
        text: 'No API key configured. Go to Settings and enter your Gemini API key to enable real AI responses.',
        sender: 'ykai',
        timestamp: new Date(),
      });
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

    setIsStreaming(true);

    try {
      const stream = streamGeminiResponse(
        settings.geminiApiKey,
        historyBeforeUserMsg,
        userText,
        systemPrompt
      );

      for await (const chunk of stream) {
        accumulated += chunk;
        updateLastMessage(accumulated);
      }

      if (!accumulated.trim()) {
        updateLastMessage('No response received. Please try again.');
      }

      console.log('[YKAI] Gemini response complete, length:', accumulated.length);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[YKAI] Gemini error:', msg);
      setError(msg);
      updateLastMessage(`Error: ${msg}`);
    } finally {
      setIsStreaming(false);
    }
  }, [input, isStreaming, settings.geminiApiKey, settings.personality, activeMode, addMessage, updateLastMessage, buildHistory]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-4xl mx-auto">

      {/* Header */}
      <div className="glass-panel p-4 rounded-t-xl border-b-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center neon-border">
            <Terminal className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display font-semibold tracking-wide text-primary neon-text">{activeMode.name}</h2>
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${settings.geminiApiKey ? 'bg-primary animate-pulse' : 'bg-yellow-500'}`} />
              <span className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
                {isStreaming ? 'Generating...' : settings.geminiApiKey ? 'YKAI - FUTURISTIC AI' : 'No API Key — Demo Mode'}
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

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            key="error-banner"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-900/30 border-x border-red-500/30 px-4 py-2 flex items-center gap-2"
            data-testid="banner-error"
          >
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="text-xs font-mono text-red-300 break-all">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-300 text-xs font-mono shrink-0"
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
            placeholder={
              isStreaming
                ? 'YKAI is generating...'
                : settings.geminiApiKey
                  ? `Message ${activeMode.name}...`
                  : 'Configure API key in Settings to enable AI...'
            }
            disabled={isStreaming}
            className="w-full bg-background/50 border-white/10 text-foreground h-14 pl-4 pr-16 rounded-lg font-mono text-sm focus-visible:ring-primary focus-visible:border-primary transition-all duration-300 neon-border-focus disabled:opacity-60"
            data-testid="input-chat"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isStreaming}
            className="absolute right-2 bg-primary/20 hover:bg-primary/40 text-primary border border-primary/50 neon-border h-10 w-10 transition-all duration-200"
            data-testid="button-send-chat"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <p className="text-[10px] font-mono text-muted-foreground/40 mt-2 text-center uppercase tracking-widest">
          {settings.geminiApiKey ? 'Gemini 1.5 Flash · End-to-end encrypted' : 'Add Gemini API key in Settings for live AI'}
        </p>
      </div>

    </div>
  );
}
