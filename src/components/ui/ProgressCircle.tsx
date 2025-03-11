
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
}) => {
  const circleRef = useRef<SVGCircleElement>(null);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const dashOffset = circumference - (percentage / 100) * circumference;

  useEffect(() => {
    if (circleRef.current && animate) {
      circleRef.current.style.setProperty('--progress', percentage.toString());
      circleRef.current.style.strokeDashoffset = dashOffset.toString();
    }
  }, [percentage, dashOffset, animate]);

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
            className={animate ? "animate-progress-circular progress-circle" : ""}
            style={!animate ? { strokeDashoffset: dashOffset } : {}}
          />
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
