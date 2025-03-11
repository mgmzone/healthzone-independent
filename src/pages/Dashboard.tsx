
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProgressCircle from "@/components/ProgressCircle";
import { useAuth } from '@/lib/AuthContext';
import Layout from '@/components/Layout';

const Dashboard = () => {
  const { profile, profileLoading, refreshProfile } = useAuth();

  useEffect(() => {
    if (!profile && !profileLoading) {
      refreshProfile();
    }
  }, [profile, profileLoading, refreshProfile]);

  // Get the unit based on user preference
  const isImperial = profile?.measurementUnit === 'imperial';
  const weightUnit = isImperial ? 'lbs' : 'kg';

  // Convert weight based on measurement unit if needed
  const convertWeight = (weight: number) => {
    if (!weight) return 0;
    if (isImperial) {
      return weight; // Already in imperial units from the database
    }
    return weight; // Already in metric units from the database
  };

  // Calculate a sensible weight difference display
  const getWeightDifference = () => {
    if (profile?.currentWeight && profile?.targetWeight) {
      const difference = Number(profile.currentWeight) - Number(profile.targetWeight);
      return difference > 0 ? `-${difference.toFixed(1)} ${weightUnit}` : `+${Math.abs(difference).toFixed(1)} ${weightUnit}`;
    }
    return 'No data';
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Weight Progress Card */}
          <Card className="col-span-1">
            <CardHeader className="pb-2">
              <CardTitle>Weight Progress</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="mb-4 text-center">
                <ProgressCircle 
                  value={profile?.currentWeight && profile?.targetWeight
                    ? Math.min(100, Math.max(0, ((profile.currentWeight - profile.targetWeight) / profile.targetWeight) * 100))
                    : 0
                  } 
                  size={140} 
                  label="PROGRESS"
                  valueLabel={getWeightDifference()}
                />
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Current Weight: {profile?.currentWeight ? `${convertWeight(profile.currentWeight)} ${weightUnit}` : 'Not set'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Target Weight: {profile?.targetWeight ? `${convertWeight(profile.targetWeight)} ${weightUnit}` : 'Not set'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Fitness Level Card */}
          <Card className="col-span-1">
            <CardHeader className="pb-2">
              <CardTitle>Fitness Level</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{profile?.fitnessLevel || 'Not set'}</p>
              <p className="text-sm text-muted-foreground">
                Based on your profile settings.
              </p>
            </CardContent>
          </Card>

          {/* Health Goals Card */}
          <Card className="col-span-1">
            <CardHeader className="pb-2">
              <CardTitle>Health Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{profile?.healthGoals || 'No goals set'}</p>
              <p className="text-sm text-muted-foreground">
                Your personal health objectives.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
