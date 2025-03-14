
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface StatisticInputProps {
  id: string;
  label: string;
  value: string;
  badge?: {
    text: string;
    variant: "secondary" | "destructive";
  };
}

const StatisticInput: React.FC<StatisticInputProps> = ({
  id,
  label,
  value,
  badge
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-left block">{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          value={value}
          disabled
          className="bg-muted/50"
        />
        {badge && (
          <Badge variant={badge.variant} className="text-xs">
            {badge.text}
          </Badge>
        )}
      </div>
    </div>
  );
};

export default StatisticInput;
