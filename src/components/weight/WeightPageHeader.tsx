
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface WeightPageHeaderProps {
  currentPeriod: any;
  onAddWeight: () => void;
}

const WeightPageHeader: React.FC<WeightPageHeaderProps> = ({
  currentPeriod,
  onAddWeight
}) => {
  const navigate = useNavigate();
  
  if (!currentPeriod) {
    return (
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No active period</AlertTitle>
        <AlertDescription className="flex justify-between items-center">
          <span>You need to create a period to track your weight progress effectively.</span>
          <Button size="sm" variant="outline" onClick={() => navigate('/periods')}>
            Create Period
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default WeightPageHeader;
