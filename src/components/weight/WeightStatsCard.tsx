
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface WeightStatsCardProps {
  value: number;
  label: string;
  unit?: string;
  isCompact?: boolean;
  isNegative?: boolean;
}

const WeightStatsCard: React.FC<WeightStatsCardProps> = ({
  value,
  label,
  unit = '',
  isCompact = false,
  isNegative = false
}) => {
  const formattedValue = value.toFixed(1);
  
  return (
    <Card className={cn(
      "overflow-hidden",
      isCompact && "bg-gray-50",
      isNegative && "bg-red-50"
    )}>
      <CardContent className={cn(
        "flex flex-col items-center justify-center",
        isCompact ? "p-3" : "p-6"
      )}>
        <div className={cn(
          "flex items-end",
          isCompact ? "text-2xl" : "text-4xl font-bold"
        )}>
          {formattedValue}
          {unit && <span className="ml-1 text-sm text-gray-500">{unit}</span>}
        </div>
        <p className={cn(
          "text-gray-500 mt-1",
          isCompact ? "text-xs" : "text-sm"
        )}>
          {label}
        </p>
      </CardContent>
    </Card>
  );
};

export default WeightStatsCard;
