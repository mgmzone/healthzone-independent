
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface WeightInputFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  weightUnit: string;
  placeholder?: string;
  type?: string;
  step?: string;
  min?: string;
  max?: string;
  className?: string;
}

const WeightInputField: React.FC<WeightInputFieldProps> = ({
  id,
  label,
  value,
  onChange,
  weightUnit,
  placeholder,
  type = "text",
  step = "0.01",
  min,
  max,
  className
}) => {
  // Handle input changes with support for decimal values
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Using the same approach as BaseWeightForm - just directly update
    // This allows proper decimal input without regex restrictions
    onChange(newValue);
  };
  
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label} ({weightUnit})</Label>
      <Input
        id={id}
        type="number"
        value={value}
        onChange={handleChange}
        placeholder={placeholder || `Enter ${label.toLowerCase()} in ${weightUnit}`}
        className={className}
        inputMode="decimal"
        step={step}
        min={min}
        max={max}
      />
    </div>
  );
};

export default WeightInputField;
