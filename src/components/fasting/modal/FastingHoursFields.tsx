
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FastingHoursFieldsProps {
  fastingHours: string;
  setFastingHours: (hours: string) => void;
  eatingWindowHours: string;
  setEatingWindowHours: (hours: string) => void;
  isAutoCalculate: boolean;
  setIsAutoCalculate: (auto: boolean) => void;
}

const FastingHoursFields: React.FC<FastingHoursFieldsProps> = ({
  fastingHours,
  setFastingHours,
  eatingWindowHours,
  setEatingWindowHours,
  isAutoCalculate,
  setIsAutoCalculate
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label htmlFor="fastingHours">Fasting Hours</Label>
        <Input
          id="fastingHours"
          type="number"
          min="1"
          max="48"
          step="0.01"
          value={fastingHours}
          onChange={(e) => {
            setFastingHours(e.target.value);
            if (isAutoCalculate) {
              const value = parseFloat(e.target.value) || 0;
              setEatingWindowHours((24 - value).toFixed(2));
            }
          }}
        />
      </div>
      <div>
        <Label htmlFor="eatingWindowHours">Eating Window Hours</Label>
        <Input
          id="eatingWindowHours"
          type="number"
          min="1"
          max="23"
          step="0.01"
          value={eatingWindowHours}
          onChange={(e) => {
            setEatingWindowHours(e.target.value);
            setIsAutoCalculate(false);
          }}
        />
      </div>
    </div>
  );
};

export default FastingHoursFields;
