
import React from 'react';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";

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
  description?: string;
  name?: string; // Add name prop for FormField
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
  className,
  description,
  name = id // Default to id if name not provided
}) => {
  const form = useFormContext();
  
  // Handle input changes with support for decimal values
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };
  
  // If within a form context, use FormField, otherwise fall back to the direct approach
  if (form) {
    return (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel htmlFor={id}>{label} ({weightUnit})</FormLabel>
            <FormControl>
              <Input
                id={id}
                type="number"
                placeholder={placeholder || `Enter ${label.toLowerCase()} in ${weightUnit}`}
                className={className}
                inputMode="decimal"
                step={step}
                min={min}
                max={max}
                {...field}
                // Override these specific field properties to maintain existing behavior
                value={value}
                onChange={handleChange}
              />
            </FormControl>
            {description && <FormDescription>{description}</FormDescription>}
          </FormItem>
        )}
      />
    );
  }
  
  // Fallback to direct usage when not in a form context
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label} ({weightUnit})
      </label>
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
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
  );
};

export default WeightInputField;
