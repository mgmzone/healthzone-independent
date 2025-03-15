
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import DatePickerField from './DatePickerField';
import AdditionalMetricsSection from './AdditionalMetricsSection';
import { DialogFooter } from '@/components/ui/dialog';

interface BaseWeightFormProps {
  onClose: () => void;
  onSave: (weight: number, date: Date, additionalMetrics?: {
    bmi?: number;
    bodyFatPercentage?: number;
    skeletalMuscleMass?: number;
    boneMass?: number;
    bodyWaterPercentage?: number;
  }) => void;
  unit: string;
}

const BaseWeightForm: React.FC<BaseWeightFormProps> = ({
  onClose,
  onSave,
  unit
}) => {
  const [weight, setWeight] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [showAdditionalMetrics, setShowAdditionalMetrics] = useState(false);
  const [bmi, setBmi] = useState<string>('');
  const [bodyFatPercentage, setBodyFatPercentage] = useState<string>('');
  const [skeletalMuscleMass, setSkeletalMuscleMass] = useState<string>('');
  const [boneMass, setBoneMass] = useState<string>('');
  const [bodyWaterPercentage, setBodyWaterPercentage] = useState<string>('');
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate the weight value
    const weightValue = parseFloat(weight);
    if (isNaN(weightValue) || weightValue <= 0) {
      toast({
        title: "Invalid weight",
        description: "Please enter a valid weight value",
        variant: "destructive",
      });
      return;
    }
    
    // Process additional metrics
    const additionalMetrics = {
      bmi: bmi ? parseFloat(bmi) : undefined,
      bodyFatPercentage: bodyFatPercentage ? parseFloat(bodyFatPercentage) : undefined,
      skeletalMuscleMass: skeletalMuscleMass ? parseFloat(skeletalMuscleMass) : undefined,
      boneMass: boneMass ? parseFloat(boneMass) : undefined,
      bodyWaterPercentage: bodyWaterPercentage ? parseFloat(bodyWaterPercentage) : undefined
    };

    console.log("Submitting weight form:", { weightValue, date, additionalMetrics });
    
    try {
      onSave(weightValue, date, additionalMetrics);
    } catch (error) {
      console.error("Error submitting weight form:", error);
      toast({
        title: "Error adding weight",
        description: "An error occurred while saving your weight data",
        variant: "destructive",
      });
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="py-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="weight">Weight ({unit})</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder={`Enter your weight in ${unit}`}
            autoFocus
          />
        </div>
        
        <DatePickerField 
          date={date} 
          onChange={setDate} 
        />
        
        <AdditionalMetricsSection
          showAdditionalMetrics={showAdditionalMetrics}
          setShowAdditionalMetrics={setShowAdditionalMetrics}
          unit={unit}
          bmi={bmi}
          setBmi={setBmi}
          bodyFatPercentage={bodyFatPercentage}
          setBodyFatPercentage={setBodyFatPercentage}
          skeletalMuscleMass={skeletalMuscleMass}
          setSkeletalMuscleMass={setSkeletalMuscleMass}
          boneMass={boneMass}
          setBoneMass={setBoneMass}
          bodyWaterPercentage={bodyWaterPercentage}
          setBodyWaterPercentage={setBodyWaterPercentage}
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  );
};

export default BaseWeightForm;
