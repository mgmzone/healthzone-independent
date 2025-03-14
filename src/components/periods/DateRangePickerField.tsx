
import React from 'react';
import { format } from "date-fns";
import { CalendarIcon, InfoIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DateRangePickerFieldProps {
  startDate: Date;
  endDate?: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date | undefined) => void;
  calculatedEndDate?: Date;
}

const DateRangePickerField: React.FC<DateRangePickerFieldProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  calculatedEndDate
}) => {
  return (
    <>
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
              onSelect={(date) => date && onStartDateChange(date)}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="endDate">End Date</Label>
          {calculatedEndDate && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <InfoIcon className="h-3 w-3 mr-1" />
                    <span>Calculated based on your weight goals</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This date is calculated based on your starting weight, target weight, and weight loss per week.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
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
              onSelect={onEndDateChange}
              initialFocus
              fromDate={startDate}
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
        {calculatedEndDate && !endDate && (
          <p className="text-xs text-muted-foreground mt-1">
            Projected completion: {format(calculatedEndDate, "PPP")}
          </p>
        )}
      </div>
    </>
  );
};

export default DateRangePickerField;
