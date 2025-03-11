
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Clock, Dumbbell, Info, ArrowRight, Calendar, Weight, Heart } from 'lucide-react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProgressCircle from '@/components/ui/ProgressCircle';
import WeightChart from '@/components/charts/WeightChart';
import FastingChart from '@/components/charts/FastingChart';
import ExerciseChart from '@/components/charts/ExerciseChart';
import { mockUser, mockWeighIns, mockExerciseLogs, mockFastingLogs, getProgressPercentage } from '@/lib/types';
import { Separator } from '@/components/ui/separator';

const Dashboard = () => {
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'period'>('week');
  
  // Calculate progress percentage
  const weightProgress = getProgressPercentage(
    mockUser.currentWeight,
    mockUser.currentWeight + 10, // assuming starting weight was 10 more
    mockUser.targetWeight
  );

  // Get latest weigh-in data
  const latestWeighIn = mockWeighIns[mockWeighIns.length - 1];
  
  // Get latest fasting data
  const latestFasting = mockFastingLogs[mockFastingLogs.length - 1];
  const isFasting = !latestFasting.endTime;
  
  // Count exercise stats
  const totalExerciseMinutes = mockExerciseLogs.reduce((total, log) => total + log.minutes, 0);
  const exerciseTypes = mockExerciseLogs.reduce((acc, log) => {
    acc[log.type] = (acc[log.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const mostFrequentExercise = Object.entries(exerciseTypes).sort((a, b) => b[1] - a[1])[0]?.[0] || 'walk';

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Hello, {mockUser.name}</h1>
          <p className="text-muted-foreground">Here's an overview of your health journey</p>
        </header>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="col-span-1 md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle>Weight Progress</CardTitle>
              <CardDescription>Your journey toward your goal weight</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex flex-col justify-center">
                  <ProgressCircle 
                    percentage={weightProgress} 
                    size={140} 
                    label="PROGRESS"
                    valueLabel={`-${(mockUser.currentWeight + 10 - mockUser.currentWeight).toFixed(1)} kg`}
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">CURRENT WEIGHT</div>
                    <div className="text-4xl font-bold">{mockUser.currentWeight}</div>
                    <div className="text-xs text-muted-foreground mt-1">kg</div>
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">TARGET WEIGHT</div>
                    <div className="text-4xl font-bold">{mockUser.targetWeight}</div>
                    <div className="text-xs text-muted-foreground mt-1">kg</div>
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">REMAINING</div>
                    <div className="text-4xl font-bold">{(mockUser.currentWeight - mockUser.targetWeight).toFixed(1)}</div>
                    <div className="text-xs text-muted-foreground mt-1">kg to lose</div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild size="sm" className="w-full sm:w-auto">
                <Link to="/weight" className="flex items-center justify-center gap-1">
                  View Details <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Fasting Status</CardTitle>
              <CardDescription>Your current fasting window</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <div className="text-center mb-4">
                <div className="text-lg font-semibold">
                  {isFasting ? "You're fasting!" : "Not currently fasting"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isFasting 
                    ? "Keep going, you're doing great!"
                    : "Start a new fast when you're ready"
                  }
                </div>
              </div>
              <div className="w-32 h-32 rounded-full border-4 border-primary flex items-center justify-center mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">16:8</div>
                  <div className="text-xs text-muted-foreground">Current plan</div>
                </div>
              </div>
              <Button variant="primary" className="w-full">
                {isFasting ? "End Fast" : "Start Fast"}
              </Button>
            </CardContent>
            <CardFooter>
              <Button variant="outline" asChild size="sm" className="w-full sm:w-auto">
                <Link to="/fasting" className="flex items-center justify-center gap-1">
                  View History <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Weight className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Latest Weight</div>
                <div className="text-2xl font-bold">{latestWeighIn.weight} kg</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Weight Log Streak</div>
                <div className="text-2xl font-bold">8 weeks</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Dumbbell className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Exercise This Week</div>
                <div className="text-2xl font-bold">{totalExerciseMinutes} min</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Fasting Streak</div>
                <div className="text-2xl font-bold">7 days</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="mb-8">
          <Tabs defaultValue="weight">
            <div className="flex items-center justify-between mb-6">
              <TabsList>
                <TabsTrigger value="weight" className="flex items-center gap-1">
                  <BarChart className="h-4 w-4" />
                  <span>Weight</span>
                </TabsTrigger>
                <TabsTrigger value="fasting" className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Fasting</span>
                </TabsTrigger>
                <TabsTrigger value="exercise" className="flex items-center gap-1">
                  <Dumbbell className="h-4 w-4" />
                  <span>Exercise</span>
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-3">
                <Button 
                  size="sm" 
                  variant={timeFilter === 'week' ? 'default' : 'outline'} 
                  onClick={() => setTimeFilter('week')}
                >
                  Week
                </Button>
                <Button 
                  size="sm" 
                  variant={timeFilter === 'month' ? 'default' : 'outline'} 
                  onClick={() => setTimeFilter('month')}
                >
                  Month
                </Button>
                <Button 
                  size="sm" 
                  variant={timeFilter === 'period' ? 'default' : 'outline'} 
                  onClick={() => setTimeFilter('period')}
                >
                  Period
                </Button>
              </div>
            </div>

            <Card>
              <TabsContent value="weight" className="mt-0">
                <CardHeader>
                  <CardTitle>Weight Progress</CardTitle>
                  <CardDescription>Track your weight loss journey over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <WeightChart 
                      data={mockWeighIns} 
                      timeFilter={timeFilter} 
                      targetWeight={mockUser.targetWeight}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" asChild>
                    <Link to="/weight" className="flex items-center gap-1">
                      <span>View All Weight Data</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </TabsContent>

              <TabsContent value="fasting" className="mt-0">
                <CardHeader>
                  <CardTitle>Fasting Schedule</CardTitle>
                  <CardDescription>Your fasting and eating windows over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <FastingChart 
                      data={mockFastingLogs} 
                      timeFilter={timeFilter}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" asChild>
                    <Link to="/fasting" className="flex items-center gap-1">
                      <span>View All Fasting Data</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </TabsContent>

              <TabsContent value="exercise" className="mt-0">
                <CardHeader>
                  <CardTitle>Exercise Activity</CardTitle>
                  <CardDescription>Your exercise minutes over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ExerciseChart 
                      data={mockExerciseLogs} 
                      timeFilter={timeFilter}
                      metricType="minutes"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" asChild>
                    <Link to="/exercise" className="flex items-center gap-1">
                      <span>View All Exercise Data</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </TabsContent>
            </Card>
          </Tabs>
        </div>

        {/* Health Tips */}
        <div>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  Health Tips
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium mb-1">Benefits of Intermittent Fasting</h3>
                  <p className="text-sm text-muted-foreground">
                    Intermittent fasting can improve metabolic health, reduce inflammation, and potentially extend lifespan. 
                    Start with a 16:8 schedule and adjust as needed.
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium mb-1">Consistent Exercise Matters</h3>
                  <p className="text-sm text-muted-foreground">
                    Regular moderate exercise is more effective for long-term weight management than occasional intense workouts. 
                    Aim for at least 30 minutes daily.
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="font-medium mb-1">Weekly Weigh-Ins</h3>
                  <p className="text-sm text-muted-foreground">
                    Weighing yourself consistently (such as every Monday, Wednesday, and Friday) provides better insights than daily weigh-ins, 
                    which can fluctuate due to water weight.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
