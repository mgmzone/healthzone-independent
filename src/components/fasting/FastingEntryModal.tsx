
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import DatePickerField from '@/components/weight/DatePickerField';
import { FastingLog } from '@/lib/types';
import { format, addHours } from 'date-fns';

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
}

const FastingEntryModal: React.FC<FastingEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialFast
}) => {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState<string>("08:00");
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [endTime, setEndTime] = useState<string>("16:00");
  const [fastingHours, setFastingHours] = useState<string>("16");
  const [eatingWindowHours, setEatingWindowHours] = useState<string>("8");
  
  useEffect(() => {
    if (initialFast) {
      const start = new Date(initialFast.startTime);
      setStartDate(start);
      setStartTime(format(start, 'HH:mm'));
      
      if (initialFast.endTime) {
        const end = new Date(initialFast.endTime);
        setEndDate(end);
        setEndTime(format(end, 'HH:mm'));
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
      
      const end = addHours(now, 16);
      setEndDate(end);
      setEndTime(format(end, 'HH:mm'));
      
      setFastingHours("16");
      setEatingWindowHours("8");
    }
  }, [initialFast, isOpen]);

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
          <div className="grid grid-cols-4 gap-4 items-end">
            <div className="col-span-3">
              <DatePickerField
                date={startDate}
                onChange={setStartDate}
              />
            </div>
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4 items-end">
            <div className="col-span-3">
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                {endDate ? (
                  <DatePickerField
                    date={endDate}
                    onChange={setEndDate}
                  />
                ) : (
                  <Button
                    id="endDate"
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    onClick={() => setEndDate(new Date())}
                  >
                    Select end date
                  </Button>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={!endDate}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fastingHours">Fasting Hours</Label>
              <Input
                id="fastingHours"
                type="number"
                min="1"
                max="48"
                value={fastingHours}
                onChange={(e) => setFastingHours(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="eatingWindowHours">Eating Window Hours</Label>
              <Input
                id="eatingWindowHours"
                type="number"
                min="1"
                max="23"
                value={eatingWindowHours}
                onChange={(e) => setEatingWindowHours(e.target.value)}
              />
            </div>
          </div>
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
