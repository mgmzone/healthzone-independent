
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Plus } from "lucide-react";

interface NoPeriodAlertProps {
  onCreatePeriod: () => void;
}

const NoPeriodAlert: React.FC<NoPeriodAlertProps> = ({ onCreatePeriod }) => {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Create Your First Period</h2>
          <p className="text-muted-foreground mb-6">
            To start tracking your progress, you need to create your first period.
            A period represents a phase in your health journey, like weight loss or maintenance.
          </p>
          <Button size="lg" onClick={onCreatePeriod}>
            <Plus className="mr-2" /> Create First Period
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NoPeriodAlert;
