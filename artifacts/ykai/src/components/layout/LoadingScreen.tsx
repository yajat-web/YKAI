import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const LoadingScreen = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const hasVisited = sessionStorage.getItem('ykai_visited');
    if (hasVisited) {
      setIsVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem('ykai_visited', 'true');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
          data-testid="loading-screen"
        >
          <div className="relative flex flex-col items-center">
            <motion.div 
              className="w-16 h-16 border-t-2 border-r-2 border-primary rounded-full animate-spin mb-8"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            />
            <div className="absolute inset-0 w-16 h-16 rounded-full shadow-[0_0_15px_rgba(0,255,255,0.5)] opacity-50" />
            
            <motion.h1 
              className="text-2xl font-display font-bold text-primary neon-text tracking-widest"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              YKAI OS v3.1
            </motion.h1>
            <motion.p 
              className="text-muted-foreground mt-2 font-mono text-sm tracking-widest uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              Initializing neural core...
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
