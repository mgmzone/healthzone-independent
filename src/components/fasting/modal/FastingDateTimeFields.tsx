
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DatePickerField from '@/components/weight/DatePickerField';
import { format } from 'date-fns';

interface FastingDateTimeFieldsProps {
  startDate: Date;
  setStartDate: (date: Date) => void;
  startTime: string;
  setStartTime: (time: string) => void;
  endDate: Date | null;
  setEndDate: (date: Date | null) => void;
  endTime: string;
  setEndTime: (time: string) => void;
}

const FastingDateTimeFields: React.FC<FastingDateTimeFieldsProps> = ({
  startDate,
  setStartDate,
  startTime,
  setStartTime,
  endDate,
  setEndDate,
  endTime,
  setEndTime
}) => {
  return (
    <>
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
    </>
  );
};

export default FastingDateTimeFields;
