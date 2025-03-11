
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FastingLog } from '@/lib/types';
import { format, addHours } from 'date-fns';
import FastingDateTimeFields from './modal/FastingDateTimeFields';
import FastingHoursFields from './modal/FastingHoursFields';
import { useFastingTimeCalculation } from '@/hooks/useFastingTimeCalculation';

interface FastingEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: {
    startTime: Date;
    endTime?: Date;
    fastingHours?: number;
    eatingWindowHours?: number;
  }) => void;
  initialFast?: FastingLog;
  defaultFastingSchedule?: string;
}

const FastingEntryModal: React.FC<FastingEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialFast,
  defaultFastingSchedule = '16:8'
}) => {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState<string>("08:00");
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [endTime, setEndTime] = useState<string>("16:00");
  const [isAutoCalculate, setIsAutoCalculate] = useState(true);
  
  const {
    fastingHours,
    setFastingHours,
    eatingWindowHours,
    setEatingWindowHours
  } = useFastingTimeCalculation(startDate, startTime, endDate, endTime, isAutoCalculate);

  useEffect(() => {
    if (initialFast) {
      const start = new Date(initialFast.startTime);
      setStartDate(start);
      setStartTime(format(start, 'HH:mm'));
      
      if (initialFast.endTime) {
        const end = new Date(initialFast.endTime);
        setEndDate(end);
        setEndTime(format(end, 'HH:mm'));
        setIsAutoCalculate(false); // Disable auto-calculate when editing existing fast
      } else {
        setEndDate(null);
        setEndTime("");
      }
      
      setFastingHours(initialFast.fastingHours?.toString() || "16");
      setEatingWindowHours(initialFast.eatingWindowHours?.toString() || "8");
    } else {
      const now = new Date();
      setStartDate(now);
      setStartTime(format(now, 'HH:mm'));
      
      const [fastHours, eatHours] = defaultFastingSchedule.split(':').map(Number);
      setFastingHours(fastHours.toString());
      setEatingWindowHours(eatHours.toString());
      
      const end = addHours(now, fastHours);
      setEndDate(end);
      setEndTime(format(end, 'HH:mm'));
      
      setIsAutoCalculate(true);
    }
  }, [initialFast, isOpen, defaultFastingSchedule]);

  const handleSave = () => {
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const startDateTime = new Date(startDate);
    startDateTime.setHours(startHours, startMinutes, 0, 0);
    
    let endDateTime = undefined;
    if (endDate && endTime) {
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      endDateTime = new Date(endDate);
      endDateTime.setHours(endHours, endMinutes, 0, 0);
    }
    
    onSave({
      startTime: startDateTime,
      endTime: endDateTime,
      fastingHours: Number(fastingHours) || undefined,
      eatingWindowHours: Number(eatingWindowHours) || undefined
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initialFast ? 'Edit Fast' : 'Add Fast'}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <FastingDateTimeFields 
            startDate={startDate}
            setStartDate={setStartDate}
            startTime={startTime}
            setStartTime={setStartTime}
            endDate={endDate}
            setEndDate={setEndDate}
            endTime={endTime}
            setEndTime={setEndTime}
          />
          
          <FastingHoursFields 
            fastingHours={fastingHours}
            setFastingHours={setFastingHours}
            eatingWindowHours={eatingWindowHours}
            setEatingWindowHours={setEatingWindowHours}
            isAutoCalculate={isAutoCalculate}
            setIsAutoCalculate={setIsAutoCalculate}
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FastingEntryModal;
