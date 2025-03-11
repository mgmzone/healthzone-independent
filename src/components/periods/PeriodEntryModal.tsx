import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, InfoIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Period } from '@/lib/types';

interface PeriodEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (period: {
    startWeight: number,
    targetWeight: number,
    type: 'weightLoss' | 'maintenance',
    startDate: Date,
    endDate?: Date,
    fastingSchedule: string
  }) => void;
  defaultValues?: {
    startWeight?: number;
    targetWeight?: number;
  };
  weightUnit: string;
  initialPeriod?: Period;
}

const PeriodEntryModal: React.FC<PeriodEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  defaultValues,
  weightUnit,
  initialPeriod
}) => {
  const [startWeight, setStartWeight] = useState<string>(defaultValues?.startWeight?.toString() || '');
  const [targetWeight, setTargetWeight] = useState<string>(defaultValues?.targetWeight?.toString() || '');
  const [type, setType] = useState<'weightLoss' | 'maintenance'>('weightLoss');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [fastingSchedule, setFastingSchedule] = useState<string>('16:8');
  const { toast } = useToast();
  
  useEffect(() => {
    if (initialPeriod) {
      setStartWeight(defaultValues?.startWeight?.toString() || '');
      setTargetWeight(defaultValues?.targetWeight?.toString() || '');
      setType(initialPeriod.type);
      setStartDate(new Date(initialPeriod.startDate));
      setEndDate(initialPeriod.endDate ? new Date(initialPeriod.endDate) : undefined);
      setFastingSchedule(initialPeriod.fastingSchedule);
    }
  }, [initialPeriod, defaultValues]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const startWeightValue = parseFloat(startWeight);
    const targetWeightValue = parseFloat(targetWeight);
    
    if (isNaN(startWeightValue) || startWeightValue <= 0) {
      toast({
        title: "Invalid start weight",
        description: "Please enter a valid weight value",
        variant: "destructive",
      });
      return;
    }
    
    if (isNaN(targetWeightValue) || targetWeightValue <= 0) {
      toast({
        title: "Invalid target weight",
        description: "Please enter a valid target weight",
        variant: "destructive",
      });
      return;
    }
    
    if (endDate && startDate > endDate) {
      toast({
        title: "Invalid date range",
        description: "End date must be after start date",
        variant: "destructive",
      });
      return;
    }
    
    onSave({
      startWeight: startWeightValue,
      targetWeight: targetWeightValue,
      type,
      startDate,
      endDate,
      fastingSchedule
    });
    
    setStartWeight('');
    setTargetWeight('');
    setType('weightLoss');
    setStartDate(new Date());
    setEndDate(undefined);
    setFastingSchedule('16:8');
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{initialPeriod ? 'Edit Period' : 'Create New Period'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Period Type</Label>
              <Select value={type} onValueChange={(value) => setType(value as 'weightLoss' | 'maintenance')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weightLoss">Weight Loss</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="startWeight">Starting Weight ({weightUnit})</Label>
              <Input
                id="startWeight"
                type="number"
                step="0.1"
                value={startWeight}
                onChange={(e) => setStartWeight(e.target.value)}
                placeholder={`Enter starting weight in ${weightUnit}`}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="targetWeight">Target Weight ({weightUnit})</Label>
              <Input
                id="targetWeight"
                type="number"
                step="0.1"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                placeholder={`Enter target weight in ${weightUnit}`}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="startDate"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Select date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="endDate"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Select end date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    fromDate={startDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="fastingSchedule" className="mr-2">Fasting Schedule</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoIcon className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Format: hours fasting:hours eating</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select value={fastingSchedule} onValueChange={setFastingSchedule}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fasting schedule" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="16:8">16:8 (16h fasting, 8h eating)</SelectItem>
                  <SelectItem value="18:6">18:6 (18h fasting, 6h eating)</SelectItem>
                  <SelectItem value="20:4">20:4 (20h fasting, 4h eating)</SelectItem>
                  <SelectItem value="14:10">14:10 (14h fasting, 10h eating)</SelectItem>
                  <SelectItem value="12:12">12:12 (12h fasting, 12h eating)</SelectItem>
                </SelectContent>
              </Select>
            </div>
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

export default PeriodEntryModal;
