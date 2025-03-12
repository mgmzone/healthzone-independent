
import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import Layout from '@/components/Layout';
import ProfileHeader from '@/components/profile/ProfileHeader';
import PersonalInfoTab from '@/components/profile/PersonalInfoTab';
import HealthInfoTab from '@/components/profile/HealthInfoTab';
import { useProfileForm } from '@/hooks/useProfileForm';
import { useProfilePhoto } from '@/hooks/useProfilePhoto';
import { cn } from '@/lib/utils';
import { isProfileComplete } from '@/lib/auth';

const Profile = () => {
  const { profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = React.useState('personal');
  const profileFetchedRef = useRef(false);
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);
  
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

  // Refresh profile ONLY on mount, not on every render
  useEffect(() => {
    if (!profileFetchedRef.current) {
      console.log("Profile component mounted, refreshing profile data");
      refreshProfile();
      profileFetchedRef.current = true;
    }
    // Empty dependency array to ensure this runs only once on mount
  }, []);

  const onTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);

  const onFormSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(e);
    
    // Check if profile is complete and show success message
    if (profile && isProfileComplete(profile)) {
      setShowSuccess(true);
    }
  }, [handleSubmit, profile]);

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

  return (
    <Layout>
      <div className="container mx-auto py-8 pt-24">
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
                  <TabsTrigger 
                    value="personal"
                    className={cn(
                      "transition-all duration-200",
                      activeTab === "personal" 
                        ? "bg-blue-500 text-white hover:text-white" 
                        : "hover:bg-blue-100"
                    )}
                  >
                    Personal
                  </TabsTrigger>
                  <TabsTrigger 
                    value="health"
                    className={cn(
                      "transition-all duration-200",
                      activeTab === "health" 
                        ? "bg-green-500 text-white hover:text-white" 
                        : "hover:bg-green-100"
                    )}
                  >
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
