
import React from 'react';
import { InfoIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface FastingScheduleSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const FastingScheduleSelector: React.FC<FastingScheduleSelectorProps> = ({ 
  value, 
  onChange 
}) => {
  return (
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
      <Select value={value} onValueChange={onChange}>
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
  );
};

export default FastingScheduleSelector;
