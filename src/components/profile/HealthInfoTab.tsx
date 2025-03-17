
import React from 'react';

interface HealthInfoTabProps {
  formData: {
    startingWeight?: number;
    currentWeight?: number;
    targetWeight?: number;
    measurementUnit?: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleNumberChange: (name: string, value: string) => void;
}

const HealthInfoTab: React.FC<HealthInfoTabProps> = ({
  formData,
  handleInputChange,
  handleSelectChange,
  handleNumberChange
}) => {
  return (
    <div className="space-y-6">
      <div className="text-center p-4 bg-muted/20 rounded-lg">
        <p className="text-muted-foreground">
          Health statistics are now available on the Dashboard for easier access.
        </p>
      </div>
    </div>
  );
};

export default HealthInfoTab;
