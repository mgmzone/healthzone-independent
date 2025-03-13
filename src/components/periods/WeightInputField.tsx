
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
  step = "0.1",
  min,
  max,
  className
}) => {
  // Allow any number of digits before and after decimal point
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow empty input or valid number format (any digits before decimal, optional decimal with digits after)
    if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
      onChange(inputValue);
    }
  };
  
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label} ({weightUnit})</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder || `Enter ${label.toLowerCase()} in ${weightUnit}`}
        className={className}
        inputMode="decimal"
      />
    </div>
  );
};

export default WeightInputField;
