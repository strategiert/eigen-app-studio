import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { WorldDesign, ModuleDesign } from '@/lib/worldDesignTypes';
import { getWorldPrimaryColor, getWorldAccentColor } from '@/lib/worldDesignTypes';

interface DynamicModuleHeaderProps {
  module: {
    id: string;
    title: string;
    module_type: string;
  };
  worldDesign: WorldDesign | null;
  moduleDesign: ModuleDesign | null;
  isCompleted: boolean;
}

/**
 * Dynamic module header that uses AI-generated design instead of hardcoded styles
 */
export function DynamicModuleHeader({
  module,
  worldDesign,
  moduleDesign,
  isCompleted
}: DynamicModuleHeaderProps) {
  // Use world-specific colors instead of hardcoded MODULE_TYPE colors
  const primaryColor = getWorldPrimaryColor(worldDesign);
  const accentColor = getWorldAccentColor(worldDesign);
  
  // Use the AI-generated module title, falling back to database title
  const displayTitle = moduleDesign?.title || module.title;
  
  // Module type label in German
  const moduleTypeLabels: Record<string, string> = {
    discovery: 'Entdecken',
    knowledge: 'Wissen',
    practice: 'Üben',
    reflection: 'Reflektieren',
    challenge: 'Herausforderung'
  };
  
  const moduleTypeLabel = moduleTypeLabels[module.module_type] || 'Wissen';
  
  return (
    <div 
      className="rounded-xl p-4 border"
      style={{ 
        borderColor: primaryColor,
        background: `linear-gradient(135deg, ${primaryColor}10, transparent)`
      }}
    >
      <div className="flex items-center gap-3">
        {/* Dynamic icon placeholder using accent color */}
        <div 
          className="p-2 rounded-lg w-9 h-9 flex items-center justify-center"
          style={{ backgroundColor: `${primaryColor}20` }}
        >
          <div 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: accentColor }}
          />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className="text-xs"
              style={{ 
                borderColor: primaryColor,
                color: primaryColor
              }}
            >
              {moduleTypeLabel}
            </Badge>
            {isCompleted && (
              <Check className="h-4 w-4 text-green-500" />
            )}
          </div>
          <h2 className="text-xl font-semibold text-foreground mt-1">
            {displayTitle}
          </h2>
          {/* Show visual focus from world design if available */}
          {moduleDesign?.visualFocus && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {moduleDesign.visualFocus}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
