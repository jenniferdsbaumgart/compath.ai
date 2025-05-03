'use client';

import { useEffect, useState } from 'react';
import { Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CoinDisplayProps {
  coins: number;
  className?: string;
  animate?: boolean;
}

export function CoinDisplay({ 
  coins, 
  className, 
  animate = false 
}: CoinDisplayProps) {
  const [displayCoins, setDisplayCoins] = useState(coins);
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    if (coins !== displayCoins) {
      setIsAnimating(true);
      
      // Animate counting up or down
      const timeout = setTimeout(() => {
        setDisplayCoins(coins);
        
        // Reset animation after a delay
        setTimeout(() => {
          setIsAnimating(false);
        }, 1000);
      }, 300);
      
      return () => clearTimeout(timeout);
    }
  }, [coins, displayCoins]);
  
  return (
    <div 
      className={cn(
        "flex items-center justify-center gap-1.5 bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full font-medium border border-amber-200 transition-all",
        isAnimating && animate && "scale-110",
        className
      )}
    >
      <Coins size={18} className="text-amber-600" />
      <span className={cn(
        "transition-all",
        isAnimating && animate && "text-amber-600 font-bold"
      )}>
        {displayCoins}
      </span>
    </div>
  );
}