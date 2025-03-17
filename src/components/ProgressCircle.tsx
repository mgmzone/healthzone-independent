
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ProgressCircleProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showPercentage?: boolean;
  label?: string;
  valueLabel?: string;
  animate?: boolean;
  allowExceedGoal?: boolean; // New prop to allow showing > 100%
  children?: React.ReactNode; // Added children prop
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({
  value,
  size = 120,
  strokeWidth = 8,
  className,
  showPercentage = true,
  label,
  valueLabel,
  animate = true,
  allowExceedGoal = true, // Default to true to allow exceeding 100%
  children, // Add children to component props
}) => {
  const circleRef = useRef<SVGCircleElement>(null);
  const overflowCircleRef = useRef<SVGCircleElement>(null);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  // Calculate the dashOffset based on the value
  // For values <= 100%, we'll use this calculation
  const normalizedValue = Math.min(value, 100);
  const dashOffset = circumference - (normalizedValue / 100) * circumference;

  // For values > 100%, we'll show the overflow with a different color
  const hasOverflow = value > 100;
  const overflowValue = hasOverflow ? value - 100 : 0;
  const overflowDasharray = hasOverflow ? 
    `${(overflowValue / 100) * circumference} ${circumference}` : 
    "0 100%";

  useEffect(() => {
    if (circleRef.current && animate) {
      circleRef.current.style.setProperty('--progress', normalizedValue.toString());
      circleRef.current.style.strokeDashoffset = dashOffset.toString();
    }
    
    if (overflowCircleRef.current && animate && hasOverflow) {
      overflowCircleRef.current.style.setProperty('--overflow-progress', overflowValue.toString());
    }
  }, [normalizedValue, overflowValue, dashOffset, animate, hasOverflow]);

  // For display purposes, we show the actual value, even if it exceeds 100%
  const displayValue = Math.round(value);

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      {label && <div className="text-sm font-medium text-muted-foreground mb-2">{label}</div>}
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth={strokeWidth}
          />
          
          {/* Main progress circle (0-100%) */}
          <circle
            ref={circleRef}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={animate ? circumference : dashOffset}
            strokeLinecap="round"
            className={animate ? "transition-all duration-1000 ease-out" : ""}
            style={{
              strokeDashoffset: animate ? dashOffset : undefined,
              transition: animate ? 'stroke-dashoffset 1s ease-out' : undefined
            }}
          />
          
          {/* Overflow progress circle (>100%) */}
          {allowExceedGoal && hasOverflow && (
            <circle
              ref={overflowCircleRef}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="hsl(var(--accent))"
              strokeWidth={strokeWidth}
              strokeDasharray={overflowDasharray}
              strokeDashoffset={0}
              strokeLinecap="round"
              className={animate ? "transition-all duration-1000 ease-out" : ""}
              style={{
                transition: animate ? 'stroke-dasharray 1s ease-out' : undefined
              }}
            />
          )}
        </svg>
        {showPercentage && !children && (
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold">{displayValue}%</span>
            {valueLabel && <span className="text-xs text-muted-foreground">{valueLabel}</span>}
          </div>
        )}
        {children && (
          <div className="absolute flex flex-col items-center justify-center text-center">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressCircle;
