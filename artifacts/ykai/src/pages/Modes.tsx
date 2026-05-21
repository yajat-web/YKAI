import { useAppContext, AIMode } from '@/lib/AppContext';
import { motion } from 'framer-motion';
import { Brain, Code, LineChart, Dumbbell, BookOpen, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MODES: AIMode[] = [
  { id: 'general', name: 'General AI', description: 'All-purpose neural assistant', icon: 'Brain' },
  { id: 'coding', name: 'Coding Assistant', description: 'Compile and debug with precision', icon: 'Code' },
  { id: 'trading', name: 'Trading Mentor', description: 'Market intelligence and analysis', icon: 'LineChart' },
  { id: 'fitness', name: 'Fitness Coach', description: 'Optimize your physical performance', icon: 'Dumbbell' },
  { id: 'study', name: 'Study Assistant', description: 'Knowledge acquisition accelerated', icon: 'BookOpen' },
  { id: 'motivation', name: 'Motivation Mode', description: 'Drive. Purpose. Execution.', icon: 'Flame' },
];

const IconMap: Record<string, any> = {
  Brain, Code, LineChart, Dumbbell, BookOpen, Flame
};

export default function Modes() {
  const { activeMode, setActiveMode } = useAppContext();

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="mb-10">
        <h1 className="text-3xl font-display font-bold text-foreground tracking-wider mb-2">Neural Personalities</h1>
        <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">Select behavioral matrix</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MODES.map((mode, index) => {
          const Icon = IconMap[mode.icon];
          const isActive = activeMode.id === mode.id;

          return (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`glass-panel p-6 rounded-xl border transition-all duration-300 group hover:-translate-y-2 flex flex-col h-full ${
                isActive 
                  ? 'border-primary/50 neon-border bg-primary/5' 
                  : 'border-white/5 hover:border-primary/30'
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`p-3 rounded-lg flex items-center justify-center ${
                  isActive ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors'
                }`}>
                  <Icon size={24} />
                </div>
                {isActive && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-mono text-primary uppercase tracking-wider">Active</span>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h3 className={`text-xl font-display font-semibold mb-2 ${isActive ? 'text-primary' : 'text-foreground group-hover:text-primary/80 transition-colors'}`}>
                  {mode.name}
                </h3>
                <p className="text-sm text-muted-foreground font-mono opacity-80">{mode.description}</p>
              </div>

              <Button
                variant={isActive ? "default" : "outline"}
                className={`mt-6 w-full font-display uppercase tracking-widest ${
                  isActive 
                    ? 'bg-primary/20 text-primary border-primary hover:bg-primary/30' 
                    : 'bg-transparent border-white/10 hover:border-primary/50 hover:text-primary hover:bg-primary/5'
                }`}
                onClick={() => setActiveMode(mode)}
                disabled={isActive}
                data-testid={`button-activate-${mode.id}`}
              >
                {isActive ? 'Engaged' : 'Activate'}
              </Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
