
import React from 'react';
import { Flame, Flag, Clock } from "lucide-react";

interface FastingProgressCircleProps {
  progress: number;
  timeElapsed: { hours: number; minutes: number; seconds: number };
  timeRemaining: { hours: number; minutes: number; seconds: number };
  fastingHours: number;
}

const FastingProgressCircle: React.FC<FastingProgressCircleProps> = ({
  progress,
  timeElapsed,
  timeRemaining,
  fastingHours
}) => {
  // Calculate angles for the progress circle
  // Reduce radius to fit better in the container
  const radius = 80; 
  const circumference = 2 * Math.PI * radius;
  const dashArray = circumference;
  const dashOffset = circumference - (progress / 100) * circumference;
  
  // Create marker positions for progress tracking
  // Start with default markers at 0, 6, 12, 18 hours
  const defaultMarkers = [0, 6, 12].map(hour => {
    const angle = (hour / fastingHours) * 360 - 90; // -90 to start at top
    const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
    const y = 50 + radius * Math.sin((angle * Math.PI) / 180);
    return { x, y, hour, special: false };
  });
  
  // Add a special marker for the goal (fastingHours)
  const goalAngle = (fastingHours / fastingHours) * 360 - 90;
  const goalX = 50 + radius * Math.cos((goalAngle * Math.PI) / 180);
  const goalY = 50 + radius * Math.sin((goalAngle * Math.PI) / 180);
  const goalMarker = { x: goalX, y: goalY, hour: fastingHours, special: true };
  
  const markers = [...defaultMarkers, goalMarker];
  
  // Check if fasting goal has been exceeded
  const hasExceededGoal = timeElapsed.hours > fastingHours || 
    (timeElapsed.hours === fastingHours && timeElapsed.minutes > 0);

  return (
    <div className="relative flex items-center justify-center">
      {/* Display fasting schedule in corner */}
      <div className="absolute top-0 right-0 text-sm font-medium bg-secondary/50 rounded-full px-2 py-1 flex items-center gap-1">
        <Clock className="w-3 h-3" />
        {fastingHours}:{24-fastingHours}
      </div>
      
      <svg className="w-64 h-64 -rotate-90">
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
        {markers.map(({ x, y, hour, special }) => (
          <circle
            key={hour}
            cx={`${x}%`}
            cy={`${y}%`}
            r={special ? "3%" : "2%"}
            fill={special ? '#F97316' : hour === 0 ? '#0EA5E9' : hour === 6 ? '#8B5CF6' : '#F97316'}
            className={special ? "animate-pulse" : ""}
          />
        ))}
      </svg>
      
      {/* Center content */}
      <div className="absolute flex flex-col items-center">
        <Flame className="w-8 h-8 text-orange-500 mb-1" />
        <div className="text-center">
          <div className="text-xs text-muted-foreground">Fasting for</div>
          <div className="text-3xl font-bold">{`${timeElapsed.hours}h ${timeElapsed.minutes}m`}</div>
          
          {/* Goal status indicator */}
          {hasExceededGoal ? (
            <div className="text-xs text-emerald-500 font-medium mt-1 flex items-center justify-center gap-1">
              <Flag className="w-3 h-3" /> Goal complete! (+{timeElapsed.hours - fastingHours}h {timeElapsed.minutes}m)
            </div>
          ) : (
            <div className="text-xs text-muted-foreground mt-1">
              Goal: {fastingHours}h ({Math.floor((timeElapsed.hours / fastingHours) * 100)}%)
            </div>
          )}
          
          <div className="text-xs text-muted-foreground mt-1">Remaining</div>
          <div className="text-base font-medium">{`${timeRemaining.hours}h ${timeRemaining.minutes}m`}</div>
        </div>
      </div>
    </div>
  );
};

export default FastingProgressCircle;
