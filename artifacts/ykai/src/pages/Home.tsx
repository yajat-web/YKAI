import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Cpu, Activity, Database, Network } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] py-12">
      
      {/* Animated Core */}
      <motion.div
        className="relative w-64 h-64 mb-12 flex items-center justify-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.div 
          className="absolute inset-0 rounded-full border border-primary/30"
          animate={{ rotate: 360, scale: [1, 1.05, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute inset-4 rounded-full border border-primary/50"
          animate={{ rotate: -360, scale: [1, 0.95, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute inset-8 rounded-full border border-primary"
          style={{ borderStyle: 'dashed' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute w-24 h-24 bg-primary/20 rounded-full blur-xl animate-pulse" />
        <h1 className="text-5xl font-display font-bold text-primary neon-text z-10">YKAI</h1>
      </motion.div>

      <motion.div 
        className="text-center max-w-2xl mb-12"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-3xl lg:text-4xl font-display font-semibold mb-4 tracking-wide text-foreground">
          Neural Intelligence. <span className="text-primary neon-text">Fully Activated.</span>
        </h2>
        <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
          Welcome to the next generation AI operating system. 
          Experience real-time synaptic processing and predictive intelligence.
        </p>

        <Link href="/chat">
          <Button 
            size="lg" 
            className="bg-primary/10 text-primary border border-primary hover:bg-primary/20 neon-border font-display tracking-widest uppercase h-14 px-8 text-lg"
            data-testid="button-launch-ykai"
          >
            Launch YKAI
          </Button>
        </Link>
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl mt-8"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {[
          { icon: Activity, label: "Neural Uptime", value: "99.9%" },
          { icon: Network, label: "Active Sessions", value: "12,847" },
          { icon: Cpu, label: "Models Online", value: "6" },
          { icon: Database, label: "Queries Today", value: "2.4M" },
        ].map((stat, i) => (
          <div key={i} className="glass-panel p-6 rounded-lg border border-white/5 flex flex-col items-center justify-center group hover:-translate-y-1 transition-transform duration-300">
            <stat.icon className="w-8 h-8 text-primary mb-3 opacity-80 group-hover:opacity-100 group-hover:drop-shadow-[0_0_8px_rgba(0,255,255,0.8)] transition-all" />
            <div className="text-2xl font-display font-bold text-foreground mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground font-mono uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </motion.div>

    </div>
  );
}
