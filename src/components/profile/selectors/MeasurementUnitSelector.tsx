
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MeasurementUnitSelectorProps {
  measurementUnit?: string;
  onMeasurementUnitChange: (value: string) => void;
}

const MeasurementUnitSelector: React.FC<MeasurementUnitSelectorProps> = ({ 
  measurementUnit, 
  onMeasurementUnitChange 
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="measurementUnit" className="text-left block">Measurement Unit</Label>
      <Select 
        value={measurementUnit || 'imperial'} 
        onValueChange={onMeasurementUnitChange}
      >
        <SelectTrigger id="measurementUnit">
          <SelectValue placeholder="Select measurement unit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="imperial">Imperial (lbs, in)</SelectItem>
          <SelectItem value="metric">Metric (kg, cm)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default MeasurementUnitSelector;
