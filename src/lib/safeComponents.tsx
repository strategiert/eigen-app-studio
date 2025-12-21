/**
 * Safe Component Library for AI-Generated Worlds
 *
 * Diese Komponenten sind "Building Blocks" die die KI verwenden kann
 * um einzigartige Layouts zu erstellen.
 *
 * Sicherheit: Nur diese pre-approved Komponenten sind verfügbar.
 */

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Sparkles, Star, Rocket, Book, Globe, Lightbulb,
  Trophy, Target, Map, Compass, Heart, Zap
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// ============================================================================
// LAYOUT COMPONENTS
// ============================================================================

/**
 * Hero Section - Großer Eingangsbereich
 */
export const Hero = ({
  children,
  gradient = "from-purple-500 to-pink-500",
  pattern = "dots"
}: {
  children: React.ReactNode;
  gradient?: string;
  pattern?: 'dots' | 'grid' | 'waves' | 'none';
}) => {
  const patterns = {
    dots: "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
    grid: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
    waves: "repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)",
    none: "none"
  };

  return (
    <motion.section
      className={`relative min-h-[60vh] flex items-center justify-center bg-gradient-to-br ${gradient} overflow-hidden`}
      style={{
        backgroundImage: patterns[pattern],
        backgroundSize: pattern === 'grid' ? '30px 30px' : 'auto'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="relative z-10 text-center px-6 max-w-4xl">
        {children}
      </div>
    </motion.section>
  );
};

/**
 * Grid Layout - Flexible Grid System
 */
export const Grid = ({
  children,
  columns = 3,
  gap = 6
}: {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: number;
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-${gap} p-6`}>
      {children}
    </div>
  );
};

/**
 * Card - Universelle Card Component
 */
export const Card = ({
  children,
  color = "bg-white/90",
  hover = true,
  padding = "p-6"
}: {
  children: React.ReactNode;
  color?: string;
  hover?: boolean;
  padding?: string;
}) => {
  return (
    <motion.div
      className={`${color} ${padding} rounded-xl backdrop-blur-sm border border-white/20 shadow-lg ${hover ? 'hover:shadow-2xl hover:scale-[1.02]' : ''} transition-all`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Story Section - Narrative/Story basiertes Layout
 */
export const StorySection = ({
  children,
  background = "bg-gradient-to-b from-transparent to-black/10"
}: {
  children: React.ReactNode;
  background?: string;
}) => {
  return (
    <section className={`py-20 px-6 ${background}`}>
      <div className="max-w-3xl mx-auto space-y-8">
        {children}
      </div>
    </section>
  );
};

/**
 * Timeline - Zeitstrahl Layout
 */
export const Timeline = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative space-y-8 py-12 px-6">
      {/* Vertical line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 to-accent/50" />
      {children}
    </div>
  );
};

export const TimelineItem = ({
  children,
  side = "left"
}: {
  children: React.ReactNode;
  side?: "left" | "right";
}) => {
  return (
    <motion.div
      className={`relative flex ${side === 'left' ? 'justify-start pr-1/2' : 'justify-end pl-1/2'}`}
      initial={{ opacity: 0, x: side === 'left' ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
    >
      <div className="w-1/2 px-8">
        <Card>{children}</Card>
      </div>
    </motion.div>
  );
};

// ============================================================================
// CONTENT COMPONENTS
// ============================================================================

/**
 * Title - Animierter Titel
 */
export const Title = ({
  children,
  size = "text-5xl",
  color = "text-white",
  glow = false
}: {
  children: React.ReactNode;
  size?: string;
  color?: string;
  glow?: boolean;
}) => {
  return (
    <motion.h1
      className={`${size} ${color} font-bold ${glow ? 'drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]' : ''}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {children}
    </motion.h1>
  );
};

/**
 * Subtitle
 */
export const Subtitle = ({
  children,
  color = "text-white/80"
}: {
  children: React.ReactNode;
  color?: string;
}) => {
  return (
    <motion.p
      className={`text-xl ${color} mt-4`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      {children}
    </motion.p>
  );
};

/**
 * Paragraph - Formatierter Text
 */
export const Paragraph = ({
  children,
  align = "left"
}: {
  children: React.ReactNode;
  align?: "left" | "center" | "right";
}) => {
  return (
    <p className={`text-base text-muted-foreground leading-relaxed text-${align}`}>
      {children}
    </p>
  );
};

/**
 * Icon - Lucide Icons mit Animation
 */
export const Icon = ({
  name,
  size = 48,
  color = "currentColor",
  animate = true
}: {
  name: string;
  size?: number;
  color?: string;
  animate?: boolean;
}) => {
  const icons: Record<string, LucideIcon> = {
    sparkles: Sparkles,
    star: Star,
    rocket: Rocket,
    book: Book,
    globe: Globe,
    lightbulb: Lightbulb,
    trophy: Trophy,
    target: Target,
    map: Map,
    compass: Compass,
    heart: Heart,
    zap: Zap
  };

  const IconComponent = icons[name.toLowerCase()] || Sparkles;

  return (
    <motion.div
      initial={animate ? { scale: 0, rotate: -180 } : undefined}
      animate={animate ? { scale: 1, rotate: 0 } : undefined}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
    >
      <IconComponent size={size} color={color} />
    </motion.div>
  );
};

/**
 * Badge - Label/Tag Component
 */
export const Badge = ({
  children,
  variant = "default"
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "info";
}) => {
  const variants = {
    default: "bg-primary text-primary-foreground",
    success: "bg-green-500 text-white",
    warning: "bg-yellow-500 text-white",
    info: "bg-blue-500 text-white"
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};

/**
 * Progress Bar
 */
export const ProgressBar = ({
  value = 0,
  max = 100,
  color = "bg-primary"
}: {
  value?: number;
  max?: number;
  color?: string;
}) => {
  const percentage = (value / max) * 100;

  return (
    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
      <motion.div
        className={`h-full ${color} rounded-full`}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1, delay: 0.5 }}
      />
    </div>
  );
};

/**
 * Action Button
 */
export const ActionButton = ({
  children,
  onClick,
  variant = "default",
  size = "default"
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}) => {
  return (
    <Button
      onClick={onClick}
      variant={variant}
      size={size}
      className="shadow-lg hover:shadow-xl transition-shadow"
    >
      {children}
    </Button>
  );
};

// ============================================================================
// INTERACTIVE COMPONENTS
// ============================================================================

/**
 * FloatingElement - Schwebende Elemente
 */
export const FloatingElement = ({
  children,
  delay = 0
}: {
  children: React.ReactNode;
  delay?: number;
}) => {
  return (
    <motion.div
      animate={{
        y: [0, -10, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        delay
      }}
    >
      {children}
    </motion.div>
  );
};

/**
 * ParallaxSection - Parallax Effect
 */
export const ParallaxSection = ({
  children,
  speed = 0.5
}: {
  children: React.ReactNode;
  speed?: number;
}) => {
  return (
    <motion.div
      initial={{ y: 0 }}
      whileInView={{ y: -20 * speed }}
      viewport={{ once: false }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
};

// Export all components as a scope object for react-live
export const SafeComponentScope = {
  motion,
  Button,
  Hero,
  Grid,
  Card,
  StorySection,
  Timeline,
  TimelineItem,
  Title,
  Subtitle,
  Paragraph,
  Icon,
  Badge,
  ProgressBar,
  ActionButton,
  FloatingElement,
  ParallaxSection,
  Sparkles, Star, Rocket, Book, Globe, Lightbulb, Trophy, Target, Map, Compass, Heart, Zap
};
