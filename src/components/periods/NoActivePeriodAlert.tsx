
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const NoActivePeriodAlert: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Alert className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>No active period</AlertTitle>
      <AlertDescription className="flex justify-between items-center">
        <span>You don't have an active period. Create a new one to continue tracking your progress.</span>
        <Button size="sm" variant="outline" onClick={() => navigate('/periods')}>
          Create Period
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default NoActivePeriodAlert;
