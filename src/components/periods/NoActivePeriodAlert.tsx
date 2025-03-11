
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const NoActivePeriodAlert: React.FC = () => {
  return (
    <Alert className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>No active period</AlertTitle>
      <AlertDescription>
        You don't have an active period. Create a new one to continue tracking your progress.
      </AlertDescription>
    </Alert>
  );
};

export default NoActivePeriodAlert;
