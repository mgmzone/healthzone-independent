
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ProgressCircleProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showPercentage?: boolean;
  label?: string;
  valueLabel?: string;
  animate?: boolean;
  allowExceedGoal?: boolean;
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({
  percentage,
  size = 120,
  strokeWidth = 8,
  className,
  showPercentage = true,
  label,
  valueLabel,
  animate = true,
  allowExceedGoal = true,
}) => {
  const circleRef = useRef<SVGCircleElement>(null);
  const overflowCircleRef = useRef<SVGCircleElement>(null);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  // Handle values over 100% if allowExceedGoal is true
  const hasOverflow = allowExceedGoal && percentage > 100;
  
  // For the main circle, fill to 100% if exceeded
  const normalizedPercentage = hasOverflow ? 100 : Math.min(Math.max(percentage, 0), 100);
  const dashOffset = circumference - (normalizedPercentage / 100) * circumference;
  
  // For values > 100%, calculate the overflow part separately
  const overflowPercentage = hasOverflow ? percentage - 100 : 0;
  const overflowDashOffset = circumference - (overflowPercentage / 100) * circumference;

  useEffect(() => {
    if (circleRef.current && animate) {
      circleRef.current.style.setProperty('--progress', normalizedPercentage.toString());
      circleRef.current.style.strokeDashoffset = dashOffset.toString();
      
      if (overflowCircleRef.current && hasOverflow) {
        overflowCircleRef.current.style.strokeDashoffset = overflowDashOffset.toString();
      }
    }
  }, [normalizedPercentage, dashOffset, animate, hasOverflow, overflowDashOffset]);

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
            className={animate ? "animate-progress-circular progress-circle" : ""}
            style={!animate ? { strokeDashoffset: dashOffset } : {}}
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
              strokeDashoffset={circumference - ((overflowPercentage / 100) * circumference)}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.5s ease" }}
            />
          )}
        </svg>
        {showPercentage && (
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold">{Math.round(percentage)}%</span>
            {valueLabel && <span className="text-xs text-muted-foreground">{valueLabel}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressCircle;
