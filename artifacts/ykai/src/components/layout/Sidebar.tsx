import { Link, useLocation } from 'wouter';
import { Home, MessageSquare, Cpu, Image as ImageIcon, Settings, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export const Sidebar = () => {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/chat', icon: MessageSquare, label: 'AI Chat' },
    { href: '/modes', icon: Cpu, label: 'AI Modes' },
    { href: '/image', icon: ImageIcon, label: 'Image Scan' },
    { href: '/settings', icon: Settings, label: 'Settings' },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-primary neon-border">
          {isOpen ? <X /> : <Menu />}
        </Button>
      </div>

      <AnimatePresence>
        {(isOpen || window.innerWidth >= 1024) && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className={`fixed lg:static top-0 left-0 h-full w-64 bg-sidebar border-r border-sidebar-border z-30 flex flex-col pt-16 lg:pt-0 ${
              isOpen ? 'shadow-[0_0_30px_rgba(0,0,0,0.8)]' : ''
            }`}
          >
            <div className="p-6 pb-2">
              <h1 className="text-2xl font-display font-bold text-primary neon-text tracking-widest">
                YKAI
              </h1>
              <p className="text-xs font-mono text-muted-foreground mt-1 uppercase tracking-widest opacity-60">
                Core OS v3.1
              </p>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
              {navItems.map((item, i) => {
                const isActive = location === item.href;
                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 + 0.2 }}
                  >
                    <Link href={item.href} onClick={() => setIsOpen(false)}>
                      <div
                        className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 cursor-pointer ${
                          isActive
                            ? 'bg-primary/10 text-primary border border-primary/30 neon-border'
                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                        }`}
                        data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                      >
                        <Icon size={20} className={isActive ? 'text-primary' : ''} />
                        <span className="font-medium tracking-wide">{item.label}</span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>

            <div className="p-6 border-t border-sidebar-border">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-mono text-primary opacity-80 uppercase tracking-widest">System Online</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
