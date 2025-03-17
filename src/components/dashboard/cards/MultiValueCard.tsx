
import React, { ReactNode } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from 'lucide-react';

interface MultiValueCardProps {
  title: string;
  values: { label: string; value: string }[];
  icon: LucideIcon;
  color: string;
  footer?: ReactNode;
}

const MultiValueCard: React.FC<MultiValueCardProps> = ({ 
  title, 
  values, 
  icon: Icon, 
  color,
  footer 
}) => {
  return (
    <Card className="border-t-4" style={{ borderTopColor: color }}>
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full" style={{ backgroundColor: `${color}10` }}>
              <Icon className="h-5 w-5" style={{ color: color }} />
            </div>
            <h3 className="font-semibold text-lg">{title}</h3>
          </div>
          <div className="grid grid-cols-1 gap-2 mt-2">
            {values.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{item.label}:</span>
                <span className="text-sm font-medium">{item.value}</span>
              </div>
            ))}
          </div>
          {footer && <div>{footer}</div>}
        </div>
      </CardContent>
    </Card>
  );
};

export default MultiValueCard;
