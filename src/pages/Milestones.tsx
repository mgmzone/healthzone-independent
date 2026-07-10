import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { useMilestones } from '@/hooks/useMilestones';
import MilestoneTimeline from '@/components/milestones/MilestoneTimeline';
import MilestoneCalendar from '@/components/milestones/MilestoneCalendar';
import MilestonesManager from '@/components/milestones/MilestonesManager';

const Milestones: React.FC = () => {
  const { milestones, isLoading } = useMilestones();

  return (
    <Layout>
      <div className="container mx-auto max-w-4xl p-4 pt-24 pb-32">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Milestones</h1>
          <p className="text-sm text-muted-foreground">
            Surgery, procedures, appointments, and follow-ups on one timeline.
          </p>
        </div>

        <Tabs defaultValue="timeline" className="space-y-6">
          <TabsList variant="underline" className="w-full">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="manage">Manage</TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <TabsContent value="timeline">
                <Card>
                  <CardContent className="pt-6">
                    <MilestoneTimeline milestones={milestones} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="calendar">
                <Card>
                  <CardContent className="pt-6">
                    <MilestoneCalendar milestones={milestones} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="manage">
                <MilestonesManager />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </Layout>
  );
};

export default Milestones;
