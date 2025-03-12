
import React, { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Layout from '@/components/Layout';
import ProfileHeader from '@/components/profile/ProfileHeader';
import PersonalInfoTab from '@/components/profile/PersonalInfoTab';
import HealthInfoTab from '@/components/profile/HealthInfoTab';
import { useProfileForm } from '@/hooks/useProfileForm';
import { useProfilePhoto } from '@/hooks/useProfilePhoto';
import { cn } from '@/lib/utils';

const Profile = () => {
  const { profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = React.useState('personal');
  const profileFetchedRef = useRef(false);
  
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

  const onFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(e);
  }, [handleSubmit]);

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
            
            <form onSubmit={onFormSubmit} className="space-y-4 mt-4">
              <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger 
                    value="personal"
                    className={cn(
                      activeTab === "personal" ? "bg-healthzone-500 text-white hover:text-white" : "",
                      "transition-all duration-200"
                    )}
                  >
                    Personal
                  </TabsTrigger>
                  <TabsTrigger 
                    value="health"
                    className={cn(
                      activeTab === "health" ? "bg-green-500 text-white hover:text-white" : "",
                      "transition-all duration-200"
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
