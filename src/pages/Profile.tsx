
import React, { useEffect } from 'react';
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

const Profile = () => {
  const { profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = React.useState('personal');
  
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

  // Refresh profile when component mounts to ensure latest data
  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  console.log("Profile Page Render - Current formData:", formData);

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
            
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="health">Health</TabsTrigger>
                </TabsList>
                
                <TabsContent value="personal">
                  <PersonalInfoTab 
                    formData={formData} 
                    handleInputChange={handleInputChange}
                    handleSelectChange={handleSelectChange}
                    handleDateChange={handleDateChange}
                  />
                </TabsContent>
                
                <TabsContent value="health">
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
