
import React from 'react';
import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";

const NoActiveFast: React.FC = () => {
  return (
    <Card className="p-4 h-full flex flex-col items-center justify-center text-center">
      <Clock className="h-10 w-10 text-muted-foreground mb-3" />
      <h2 className="text-xl font-semibold mb-2">No Active Fast</h2>
      <p className="text-muted-foreground mb-2">Start a new fast to begin tracking your progress</p>
    </Card>
  );
};

export default NoActiveFast;
