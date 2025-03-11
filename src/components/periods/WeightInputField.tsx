
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface WeightInputFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  weightUnit: string;
}

const WeightInputField: React.FC<WeightInputFieldProps> = ({
  id,
  label,
  value,
  onChange,
  weightUnit
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label} ({weightUnit})</Label>
      <Input
        id={id}
        type="number"
        step="0.1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter ${label.toLowerCase()} in ${weightUnit}`}
      />
    </div>
  );
};

export default WeightInputField;
