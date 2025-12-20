import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

// Page enter/exit animation wrapper
export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Card reveal animation
export function CardReveal({ 
  children, 
  delay = 0,
  className 
}: { 
  children: ReactNode; 
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Staggered list animation
export function StaggeredList({ 
  children,
  staggerDelay = 0.05,
  className
}: { 
  children: ReactNode[];
  staggerDelay?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.3,
            delay: index * staggerDelay,
            ease: "easeOut"
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}

// Success pulse animation
export function SuccessPulse({ 
  show,
  children,
  color = 'hsl(142, 71%, 45%)'
}: { 
  show: boolean;
  children: ReactNode;
  color?: string;
}) {
  return (
    <div className="relative inline-block">
      {children}
      <AnimatePresence>
        {show && (
          <motion.div
            className="absolute inset-0 rounded-lg pointer-events-none"
            initial={{ opacity: 0.8, scale: 1 }}
            animate={{ opacity: 0, scale: 1.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ 
              border: `2px solid ${color}`,
              boxShadow: `0 0 20px ${color}`
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Hover scale effect
export function HoverScale({ 
  children,
  scale = 1.02,
  className
}: { 
  children: ReactNode;
  scale?: number;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: scale - 0.05 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Shake animation for errors
export function ShakeOnError({ 
  shake,
  children 
}: { 
  shake: boolean;
  children: ReactNode;
}) {
  return (
    <motion.div
      animate={shake ? {
        x: [-10, 10, -10, 10, -5, 5, 0],
        transition: { duration: 0.5 }
      } : {}}
    >
      {children}
    </motion.div>
  );
}

// Confetti burst effect
interface ConfettiParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  size: number;
}

export function ConfettiBurst({ 
  trigger,
  colors = ['#FFD700', '#4AAEFF', '#FF6B6B', '#50C878', '#9370DB'],
  particleCount = 30
}: { 
  trigger: boolean;
  colors?: string[];
  particleCount?: number;
}) {
  if (!trigger) return null;

  const particles: ConfettiParticle[] = Array.from({ length: particleCount }).map((_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 400,
    y: -200 - Math.random() * 200,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 720 - 360,
    size: 8 + Math.random() * 8
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-sm"
          style={{
            backgroundColor: particle.color,
            width: particle.size,
            height: particle.size * 0.6
          }}
          initial={{ 
            x: 0, 
            y: 0, 
            opacity: 1,
            rotate: 0
          }}
          animate={{ 
            x: particle.x,
            y: particle.y + 600,
            opacity: 0,
            rotate: particle.rotation
          }}
          transition={{
            duration: 2 + Math.random(),
            ease: [0.25, 0.1, 0.25, 1]
          }}
        />
      ))}
    </div>
  );
}
