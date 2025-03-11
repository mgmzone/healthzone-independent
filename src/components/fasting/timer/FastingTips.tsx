
import React from 'react';
import { Edit } from "lucide-react";

const FastingTips: React.FC = () => {
  return (
    <div className="mt-2 text-xs text-center">
      <div className="flex items-center justify-center gap-1 text-muted-foreground">
        <Edit className="h-3 w-3" />
        <span>Tips</span>
      </div>
      <p className="text-xs text-muted-foreground">Stay hydrated. Drink plenty of water.</p>
    </div>
  );
};

export default FastingTips;
