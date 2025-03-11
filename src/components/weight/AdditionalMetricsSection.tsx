
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface AdditionalMetricsSectionProps {
  showAdditionalMetrics: boolean;
  setShowAdditionalMetrics: (show: boolean) => void;
  unit: string;
  bmi: string;
  setBmi: (value: string) => void;
  bodyFatPercentage: string;
  setBodyFatPercentage: (value: string) => void;
  skeletalMuscleMass: string;
  setSkeletalMuscleMass: (value: string) => void;
  boneMass: string;
  setBoneMass: (value: string) => void;
  bodyWaterPercentage: string;
  setBodyWaterPercentage: (value: string) => void;
}

const AdditionalMetricsSection: React.FC<AdditionalMetricsSectionProps> = ({
  showAdditionalMetrics,
  setShowAdditionalMetrics,
  unit,
  bmi,
  setBmi,
  bodyFatPercentage,
  setBodyFatPercentage,
  skeletalMuscleMass,
  setSkeletalMuscleMass,
  boneMass,
  setBoneMass,
  bodyWaterPercentage,
  setBodyWaterPercentage
}) => {
  return (
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
  );
};

export default AdditionalMetricsSection;
