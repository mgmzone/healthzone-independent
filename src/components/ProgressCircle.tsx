
import React from 'react';
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
  allowExceedGoal?: boolean;
  children?: React.ReactNode;
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({
  value,
  size = 120,
  strokeWidth = 8,
  className,
  showPercentage = true,
  label,
  valueLabel,
  animate = false,
  allowExceedGoal = true,
  children,
}) => {
  const circleRef = React.useRef<SVGCircleElement>(null);
  const overflowCircleRef = React.useRef<SVGCircleElement>(null);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  // Handle values over 100% if allowExceedGoal is true
  const hasOverflow = allowExceedGoal && value > 100;
  
  // For the main circle, fill to 100% if exceeded
  const normalizedValue = hasOverflow ? 100 : Math.min(Math.max(value, 0), 100);
  const dashOffset = circumference - (normalizedValue / 100) * circumference;
  
  // For values > 100%, calculate the overflow part separately
  const overflowValue = hasOverflow ? value - 100 : 0;
  const overflowDashOffset = circumference - (overflowValue / 100) * circumference;

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
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
          />
          
          {/* Overflow progress circle (>100%) only drawn when there's overflow */}
          {hasOverflow && (
            <circle
              ref={overflowCircleRef}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="hsl(var(--accent))"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={overflowDashOffset}
              strokeLinecap="round"
            />
          )}
        </svg>
        {showPercentage && !children && (
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold">{Math.round(value)}%</span>
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
