
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
  // Handle input changes, allowing numbers and decimal points
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow empty values, decimal point entry, and numbers
    // This simpler regex focuses on allowing valid patterns without being too restrictive
    if (inputValue === '' || /^(\d*\.?\d*)$/.test(inputValue)) {
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
