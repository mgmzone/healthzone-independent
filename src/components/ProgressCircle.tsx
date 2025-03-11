
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
}) => {
  const circleRef = useRef<SVGCircleElement>(null);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  // Calculate the dashOffset based on the value, possibly exceeding 100%
  const progressValue = allowExceedGoal ? value : Math.min(value, 100);
  const dashOffset = circumference - (progressValue / 100) * circumference;

  useEffect(() => {
    if (circleRef.current && animate) {
      circleRef.current.style.setProperty('--progress', progressValue.toString());
      circleRef.current.style.strokeDashoffset = dashOffset.toString();
    }
  }, [progressValue, dashOffset, animate]);

  // For display purposes, we might want to show the actual value, even if it exceeds 100%
  const displayValue = Math.round(value);
  // Only clamp the value when we don't want to exceed goals
  const clampedValue = allowExceedGoal ? displayValue : Math.min(displayValue, 100);

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      {label && <div className="text-sm font-medium text-muted-foreground mb-2">{label}</div>}
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth={strokeWidth}
          />
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
        </svg>
        {showPercentage && (
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold">{clampedValue}%</span>
            {valueLabel && <span className="text-xs text-muted-foreground">{valueLabel}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressCircle;
