
import React from 'react';
import { Flame } from "lucide-react";

interface FastingProgressCircleProps {
  progress: number;
  rotations: number;
  timeElapsed: { hours: number; minutes: number; seconds: number };
  timeRemaining: { hours: number; minutes: number; seconds: number };
}

const FastingProgressCircle: React.FC<FastingProgressCircleProps> = ({
  progress,
  rotations,
  timeElapsed,
  timeRemaining
}) => {
  // Calculate angles for the progress circle
  // Increase radius by 10% from 92 to 101
  const radius = 101; 
  const circumference = 2 * Math.PI * radius;
  const dashArray = circumference;
  const dashOffset = circumference - (progress / 100) * circumference;
  
  // Create marker positions every 6 hours (90 degrees)
  const markers = [0, 6, 12, 18].map(hour => {
    const angle = (hour / 24) * 360 - 90; // -90 to start at top
    const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
    const y = 50 + radius * Math.sin((angle * Math.PI) / 180);
    return { x, y, hour };
  });

  return (
    <div className="relative flex items-center justify-center mb-6">
      <svg className="w-96 h-96 -rotate-90">
        {/* Background circle */}
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          fill="transparent"
          stroke="#1e293b"
          strokeWidth="12"
          className="opacity-20"
        />
        {/* Progress circle - gradient */}
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0EA5E9" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#F97316" />
          </linearGradient>
        </defs>
        <circle
          cx="50%"
          cy="50%"
          r={radius}
          fill="transparent"
          stroke="url(#progressGradient)"
          strokeWidth="12"
          strokeDasharray={dashArray}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
        {/* Hour markers */}
        {markers.map(({ x, y, hour }) => (
          <circle
            key={hour}
            cx={`${x}%`}
            cy={`${y}%`}
            r="2%"
            fill={hour === 0 ? '#0EA5E9' : hour === 6 ? '#8B5CF6' : hour === 12 ? '#F97316' : '#0EA5E9'}
            className="transition-all duration-300"
          />
        ))}
      </svg>
      
      {/* Center content */}
      <div className="absolute flex flex-col items-center">
        <Flame className="w-12 h-12 text-orange-500 mb-3" />
        <div className="text-center">
          <div className="text-sm text-muted-foreground">Fasting for</div>
          <div className="text-4xl font-bold">{`${timeElapsed.hours}h ${timeElapsed.minutes}m`}</div>
          {rotations > 0 && (
            <div className="text-sm text-emerald-500 font-medium mt-1">
              +{rotations} full rotation{rotations > 1 ? 's' : ''}
            </div>
          )}
          <div className="text-sm text-muted-foreground mt-1">Remaining</div>
          <div className="text-lg font-medium">{`${timeRemaining.hours}h ${timeRemaining.minutes}m`}</div>
        </div>
      </div>
    </div>
  );
};

export default FastingProgressCircle;
