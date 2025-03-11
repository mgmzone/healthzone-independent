
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PeriodTypeSelectorProps {
  value: 'weightLoss' | 'maintenance';
  onChange: (value: 'weightLoss' | 'maintenance') => void;
}

const PeriodTypeSelector: React.FC<PeriodTypeSelectorProps> = ({ 
  value, 
  onChange 
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="type">Period Type</Label>
      <Select 
        value={value} 
        onValueChange={(value) => onChange(value as 'weightLoss' | 'maintenance')}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select period type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="weightLoss">Weight Loss</SelectItem>
          <SelectItem value="maintenance">Maintenance</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default PeriodTypeSelector;
