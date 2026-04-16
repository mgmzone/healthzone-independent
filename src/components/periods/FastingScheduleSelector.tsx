import React, { useEffect, useState } from 'react';
import { InfoIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FastingScheduleSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const PRESETS: Array<{ value: string; label: string }> = [
  { value: '12:12', label: '12:12 (12h fasting, 12h eating)' },
  { value: '14:10', label: '14:10 (14h fasting, 10h eating)' },
  { value: '16:8', label: '16:8 (16h fasting, 8h eating)' },
  { value: '18:6', label: '18:6 (18h fasting, 6h eating)' },
  { value: '20:4', label: '20:4 (20h fasting, 4h eating)' },
  { value: '22:2', label: '22:2 (22h fasting, 2h eating)' },
  { value: 'OMAD', label: 'OMAD (one meal a day, ~23:1)' },
];

const CUSTOM = '__custom__';

const FastingScheduleSelector: React.FC<FastingScheduleSelectorProps> = ({ value, onChange }) => {
  const isPreset = (v: string) => PRESETS.some(p => p.value === v);
  const [mode, setMode] = useState<string>(() => (value && !isPreset(value) ? CUSTOM : value || ''));
  const [customValue, setCustomValue] = useState<string>(() => (value && !isPreset(value) ? value : ''));

  // Keep mode in sync when parent value changes (e.g. when switching to edit another period)
  useEffect(() => {
    if (!value) {
      setMode('');
      setCustomValue('');
    } else if (isPreset(value)) {
      setMode(value);
      setCustomValue('');
    } else {
      setMode(CUSTOM);
      setCustomValue(value);
    }
  }, [value]);

  const handleSelectChange = (next: string) => {
    setMode(next);
    if (next === CUSTOM) {
      onChange(customValue || '');
    } else {
      onChange(next);
    }
  };

  const handleCustomChange = (next: string) => {
    setCustomValue(next);
    onChange(next);
  };

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
              <p>Hours fasting : hours eating (e.g. 16:8). Pick a preset or choose Custom… for anything else.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Select value={mode} onValueChange={handleSelectChange}>
        <SelectTrigger id="fastingSchedule">
          <SelectValue placeholder="Select fasting schedule" />
        </SelectTrigger>
        <SelectContent>
          {PRESETS.map(p => (
            <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
          ))}
          <SelectItem value={CUSTOM}>Custom…</SelectItem>
        </SelectContent>
      </Select>

      {mode === CUSTOM && (
        <Input
          value={customValue}
          onChange={(e) => handleCustomChange(e.target.value)}
          placeholder="e.g. 21:3, 4:3 alternate, or any label you use"
        />
      )}
    </div>
  );
};

export default FastingScheduleSelector;
