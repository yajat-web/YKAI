import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { CustomCursor } from './CustomCursor';
import { LoadingScreen } from './LoadingScreen';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'wouter';

export const AppLayout = ({ children }: { children: ReactNode }) => {
  const [location] = useLocation();

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
      <CustomCursor />
      <LoadingScreen />
      
      {/* Background Grid */}
      <div 
        className="absolute inset-0 z-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <Sidebar />

      <main className="flex-1 relative z-10 overflow-x-hidden overflow-y-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="min-h-full p-6 lg:p-10 max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};
