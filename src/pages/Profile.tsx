
import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';
import Layout from '@/components/Layout';
import ProfileHeader from '@/components/profile/ProfileHeader';
import PersonalInfoTab from '@/components/profile/PersonalInfoTab';
import HealthInfoTab from '@/components/profile/HealthInfoTab';
import { useProfileForm } from '@/hooks/useProfileForm';
import { useProfilePhoto } from '@/hooks/useProfilePhoto';
import { cn } from '@/lib/utils';
import { isProfileComplete } from '@/lib/auth';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const Profile = () => {
  const { profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = React.useState('personal');
  const profileFetchedRef = useRef(false);
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(true);
  
  const {
    formData,
    isLoading,
    handleInputChange,
    handleSelectChange,
    handleDateChange,
    handleNumberChange,
    handleSubmit
  } = useProfileForm();

  const {
    fileInputRef,
    handlePhotoClick,
    handlePhotoChange
  } = useProfilePhoto();

  useEffect(() => {
    if (!profileFetchedRef.current) {
      console.log("Profile component mounted, refreshing profile data");
      refreshProfile();
      profileFetchedRef.current = true;
    }
  }, []);

  const onTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);

  const onFormSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(e);
    
    const profileComplete = profile && isProfileComplete(profile);
    
    if (profileComplete) {
      setShowSuccess(true);
      // Allow users to see the success message before redirecting
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
  }, [handleSubmit, profile, navigate]);

  const handleContinueToPeriods = () => {
    navigate('/periods');
  };

  if (!profile) {
    return (
      <Layout>
        <div className="container mx-auto py-8 pt-24">
          <Card className="w-full max-w-3xl mx-auto">
            <CardHeader>
              <div>Loading profile...</div>
            </CardHeader>
          </Card>
        </div>
      </Layout>
    );
  }

  const profileComplete = isProfileComplete(profile);
  const needsProfileCompletion = !profileComplete;

  return (
    <Layout>
      <div className="container mx-auto py-8 pt-24">
        {needsProfileCompletion && (
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <span className="sr-only">Show profile message</span>
            </PopoverTrigger>
            <PopoverContent className="w-full max-w-md mb-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <h3 className="font-medium mb-1">Complete Your Profile</h3>
                  <p className="text-sm text-muted-foreground">
                    Please complete your profile by entering your personal and health information (both tabs).
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setPopoverOpen(false)}
                  >
                    Got it
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
        
        <Card className="w-full max-w-3xl mx-auto">
          <CardHeader>
            <ProfileHeader 
              profile={profile} 
              handlePhotoClick={handlePhotoClick} 
              fileInputRef={fileInputRef} 
              handlePhotoChange={handlePhotoChange} 
            />
            
            {showSuccess && profileComplete && (
              <Alert className="mt-4 bg-green-50 border-green-200">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <AlertDescription className="flex items-center justify-between">
                  <span className="text-green-700">
                    Your profile has been updated successfully! You've completed all required information.
                  </span>
                  <Button 
                    onClick={handleContinueToPeriods}
                    className="ml-2"
                    size="sm"
                  >
                    Create a Period <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={onFormSubmit} className="space-y-4 mt-4">
              <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="personal">
                    Personal
                  </TabsTrigger>
                  <TabsTrigger value="health">
                    Health
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="personal" className="mt-4">
                  <PersonalInfoTab 
                    formData={formData} 
                    handleInputChange={handleInputChange}
                    handleSelectChange={handleSelectChange}
                    handleDateChange={handleDateChange}
                  />
                </TabsContent>
                
                <TabsContent value="health" className="mt-4">
                  <HealthInfoTab 
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleSelectChange={handleSelectChange}
                    handleNumberChange={handleNumberChange}
                  />
                </TabsContent>
              </Tabs>

              <div className="pt-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardHeader>
        </Card>
      </div>
    </Layout>
  );
};

export default Profile;
