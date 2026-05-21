import { useState, useRef, useEffect } from 'react';
import { useAppContext } from '@/lib/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const TYPING_RESPONSES = [
  "Analyzing request...",
  "Neural systems online. Processing your query.",
  "Query resolved. What else can I help you with?",
  "Scanning knowledge banks... complete.",
  "YKAI processing complete. Here's what I found:",
  "Running inference protocols... response ready.",
  "Data synchronized. Here is your answer.",
  "Neural pathways engaged. Processing..."
];

export default function Chat() {
  const { activeMode, messages, addMessage } = useAppContext();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    setInput('');
    
    addMessage({
      id: Date.now().toString(),
      text: userText,
      sender: 'user',
      timestamp: new Date()
    });

    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const randomResponse = TYPING_RESPONSES[Math.floor(Math.random() * TYPING_RESPONSES.length)];
      addMessage({
        id: (Date.now() + 1).toString(),
        text: `${randomResponse} I have analyzed "${userText.slice(0, 20)}${userText.length > 20 ? '...' : ''}" through the ${activeMode.name} matrix. The optimal path forward is clear. Proceed with execution.`,
        sender: 'ykai',
        timestamp: new Date()
      });
    }, 2000);
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
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-muted-foreground font-mono uppercase tracking-widest">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 glass-panel border-y-0 overflow-y-auto p-6 space-y-6">
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
                className={`max-w-[80%] p-4 rounded-xl font-mono text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-primary/20 border border-primary/30 text-primary-foreground ml-4'
                    : 'bg-secondary border border-white/5 text-foreground mr-4'
                }`}
                style={msg.sender === 'user' ? { boxShadow: 'inset 0 0 15px rgba(0,255,255,0.05)' } : {}}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-start"
            >
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-[10px] font-mono text-muted-foreground">Now</span>
                <span className="text-xs font-display tracking-widest uppercase text-primary/70">YKAI</span>
              </div>
              <div className="bg-secondary border border-white/5 p-4 rounded-xl mr-4 flex items-center gap-1.5">
                <motion.div className="w-1.5 h-1.5 rounded-full bg-primary" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} />
                <motion.div className="w-1.5 h-1.5 rounded-full bg-primary" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} />
                <motion.div className="w-1.5 h-1.5 rounded-full bg-primary" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="glass-panel p-4 rounded-b-xl border-t-0">
        <form onSubmit={handleSend} className="relative flex items-center">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Awaiting input for ${activeMode.name}...`}
            className="w-full bg-background/50 border-white/10 text-foreground h-14 pl-4 pr-16 rounded-lg font-mono text-sm focus-visible:ring-primary focus-visible:border-primary transition-all duration-300 neon-border-focus"
            data-testid="input-chat"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!input.trim() || isTyping}
            className="absolute right-2 bg-primary/20 hover:bg-primary/40 text-primary border border-primary/50 neon-border h-10 w-10"
            data-testid="button-send-chat"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>

    </div>
  );
}
