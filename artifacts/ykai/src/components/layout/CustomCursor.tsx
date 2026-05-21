import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const CustomCursor = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', updateMousePosition);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-64 h-64 rounded-full pointer-events-none z-50 opacity-30 mix-blend-screen hidden lg:block"
      style={{
        background: 'radial-gradient(circle, rgba(0, 255, 255, 0.4) 0%, rgba(0, 255, 255, 0) 70%)',
        transform: 'translate(-50%, -50%)',
      }}
      animate={{
        x: mousePosition.x,
        y: mousePosition.y,
      }}
      transition={{
        type: 'tween',
        ease: 'backOut',
        duration: 0.15,
      }}
    />
  );
};
