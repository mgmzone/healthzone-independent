
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { TabsContent } from '@/components/ui/tabs';

interface PreferencesTabProps {
  formData: {
    measurementUnit?: string;
  };
  handleSelectChange: (name: string, value: string) => void;
}

const PreferencesTab: React.FC<PreferencesTabProps> = ({
  formData,
  handleSelectChange
}) => {
  return (
    <TabsContent value="preferences" className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="measurementUnit">Measurement Unit</Label>
        <Select name="measurementUnit" value={formData.measurementUnit || 'metric'} onValueChange={(value) => handleSelectChange('measurementUnit', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select measurement unit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="metric">Metric (kg, cm)</SelectItem>
            <SelectItem value="imperial">Imperial (lbs, in)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Separator className="my-4" />
      <div className="space-y-2">
        <h3 className="text-lg font-medium">App Settings</h3>
        <p className="text-sm text-muted-foreground">
          More app settings will be added in future updates.
        </p>
      </div>
    </TabsContent>
  );
};

export default PreferencesTab;
