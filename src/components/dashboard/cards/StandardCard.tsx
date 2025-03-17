
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from 'lucide-react';

interface StandardCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
}

const StandardCard: React.FC<StandardCardProps> = ({ title, value, icon: Icon, color }) => {
  return (
    <Card className="border-t-4" style={{ borderTopColor: color }}>
      <CardContent className="pt-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-full" style={{ backgroundColor: `${color}10` }}>
            <Icon className="h-5 w-5" style={{ color: color }} />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StandardCard;
