
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { isProfileComplete } from '@/lib/auth';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UserCircle, CheckCircle, Calendar, ArrowRight, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const GettingStarted = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  // Use the common isProfileComplete function
  const profileComplete = isProfileComplete(profile);
  
  console.log('GettingStarted page', {
    profile,
    profileComplete,
    firstName: profile?.firstName,
    currentWeight: profile?.currentWeight,
    targetWeight: profile?.targetWeight,
    height: profile?.height
  });

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handlePeriodClick = () => {
    navigate('/dashboard');
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 mt-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Getting Started</h1>
          
          <Alert className="mb-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Complete your profile first to setup your preferences and health information. This will help us personalize your experience.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-6">
            {/* Step 1: Complete Profile */}
            <Card className={profileComplete ? 'border-green-500' : 'border-primary'}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {profileComplete ? (
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    ) : (
                      <UserCircle className="h-8 w-8 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-2">Step 1: Complete Your Profile</h2>
                    <p className="text-muted-foreground mb-4">
                      Fill in your basic information to get personalized tracking and set your measurement units.
                    </p>
                    {!profileComplete && (
                      <Button onClick={handleProfileClick} size="lg" className="mt-2">
                        Complete Profile
                        <ArrowRight className="ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 2: Create First Period */}
            <Card className={profileComplete ? '' : 'opacity-50'}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Calendar className="h-8 w-8 text-primary mt-1" />
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-2">Step 2: Create Your First Period</h2>
                    <p className="text-muted-foreground mb-4">
                      Set up your first tracking period to start monitoring your progress.
                    </p>
                    <Button 
                      onClick={handlePeriodClick}
                      disabled={!profileComplete}
                      size="lg"
                      className="mt-2"
                    >
                      Create First Period
                      <ArrowRight className="ml-2" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default GettingStarted;
