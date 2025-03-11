
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, ChevronDown, ChevronUp } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface WeightEntryModalProps {
  isOpen: boolean;
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

const WeightEntryModal: React.FC<WeightEntryModalProps> = ({
  isOpen,
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
    
    const weightValue = parseFloat(weight);
    if (isNaN(weightValue) || weightValue <= 0) {
      toast({
        title: "Invalid weight",
        description: "Please enter a valid weight value",
        variant: "destructive",
      });
      return;
    }
    
    const additionalMetrics = {
      bmi: bmi ? parseFloat(bmi) : undefined,
      bodyFatPercentage: bodyFatPercentage ? parseFloat(bodyFatPercentage) : undefined,
      skeletalMuscleMass: skeletalMuscleMass ? parseFloat(skeletalMuscleMass) : undefined,
      boneMass: boneMass ? parseFloat(boneMass) : undefined,
      bodyWaterPercentage: bodyWaterPercentage ? parseFloat(bodyWaterPercentage) : undefined
    };
    
    onSave(weightValue, date, additionalMetrics);
    resetForm();
  };
  
  const resetForm = () => {
    setWeight('');
    setDate(new Date());
    setBmi('');
    setBodyFatPercentage('');
    setSkeletalMuscleMass('');
    setBoneMass('');
    setBodyWaterPercentage('');
    setShowAdditionalMetrics(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        resetForm();
      }
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Weight</DialogTitle>
        </DialogHeader>
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
            
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Select date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                    className="pointer-events-auto"
                    disabled={(date) => date > new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <Collapsible open={showAdditionalMetrics} onOpenChange={setShowAdditionalMetrics}>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="additional-metrics">Additional Metrics (Optional)</Label>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="px-2 h-8 w-9">
                    {showAdditionalMetrics ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
              </div>
              
              <CollapsibleContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="bmi">BMI</Label>
                  <Input
                    id="bmi"
                    type="number"
                    step="0.1"
                    value={bmi}
                    onChange={(e) => setBmi(e.target.value)}
                    placeholder="Enter your BMI"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bodyFatPercentage">Body Fat (%)</Label>
                  <Input
                    id="bodyFatPercentage"
                    type="number"
                    step="0.1"
                    value={bodyFatPercentage}
                    onChange={(e) => setBodyFatPercentage(e.target.value)}
                    placeholder="Enter your body fat percentage"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="skeletalMuscleMass">Skeletal Muscle Mass ({unit})</Label>
                  <Input
                    id="skeletalMuscleMass"
                    type="number"
                    step="0.1"
                    value={skeletalMuscleMass}
                    onChange={(e) => setSkeletalMuscleMass(e.target.value)}
                    placeholder={`Enter your skeletal muscle mass in ${unit}`}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="boneMass">Bone Mass ({unit})</Label>
                  <Input
                    id="boneMass"
                    type="number"
                    step="0.1"
                    value={boneMass}
                    onChange={(e) => setBoneMass(e.target.value)}
                    placeholder={`Enter your bone mass in ${unit}`}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bodyWaterPercentage">Body Water (%)</Label>
                  <Input
                    id="bodyWaterPercentage"
                    type="number"
                    step="0.1"
                    value={bodyWaterPercentage}
                    onChange={(e) => setBodyWaterPercentage(e.target.value)}
                    placeholder="Enter your body water percentage"
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default WeightEntryModal;
