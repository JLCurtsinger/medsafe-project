
import React, { useState, useEffect, useRef } from "react";

interface AnimatedNumberProps {
  end: number;
  duration?: number;
  suffix?: string;
  className?: string;
}

export const AnimatedNumber = ({
  end,
  duration = 1000,
  suffix = "",
  className = "",
}: AnimatedNumberProps) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          
          // Start animation
          let startTime: number | null = null;
          const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            
            // Use easeOutExpo for smoother ending
            const easeOutExpo = 1 - Math.pow(2, -10 * progress);
            setCount(Math.floor(easeOutExpo * end));
            
            if (progress < 1) {
              window.requestAnimationFrame(step);
            } else {
              setCount(end);
            }
          };
          
          window.requestAnimationFrame(step);
          
          // Once animated, no need to observe anymore
          observer.unobserve(ref.current!);
        }
      },
      { threshold: 0.3 } // Trigger when 30% of the element is visible
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [end, duration, hasAnimated]);
  
  // Format number for display (handle decimals and large numbers)
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    
    if (num >= 1000) {
      return num.toLocaleString();
    }
    
    return num.toString();
  };
  
  return (
    <div ref={ref} className={className}>
      {hasAnimated ? formatNumber(count) : "0"}{suffix}
    </div>
  );
};
