
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MetricSelectorProps {
  selectedMetric: string;
  onSelectMetric: (metric: string) => void;
}

const MetricSelector: React.FC<MetricSelectorProps> = ({ 
  selectedMetric, 
  onSelectMetric 
}) => {
  const metrics = [
    { value: 'weight', label: 'Weight' },
    { value: 'bmi', label: 'BMI' },
    { value: 'bodyFatPercentage', label: 'Body Fat %' },
    { value: 'skeletalMuscleMass', label: 'Skeletal Muscle Mass' },
    { value: 'boneMass', label: 'Bone Mass' },
    { value: 'bodyWaterPercentage', label: 'Body Water %' }
  ];

  return (
    <div>
      <Select 
        value={selectedMetric} 
        onValueChange={(value) => onSelectMetric(value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select metric" />
        </SelectTrigger>
        <SelectContent>
          {metrics.map((metric) => (
            <SelectItem key={metric.value} value={metric.value}>
              {metric.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default MetricSelector;
