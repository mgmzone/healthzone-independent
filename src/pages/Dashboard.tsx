
import React, { useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import Layout from '@/components/Layout';
import ProfileHeader from '@/components/profile/ProfileHeader';
import { useProfilePhoto } from '@/hooks/useProfilePhoto';

const Dashboard = () => {
  const { profile, profileLoading, refreshProfile } = useAuth();
  const {
    fileInputRef,
    handlePhotoClick,
    handlePhotoChange
  } = useProfilePhoto();

  useEffect(() => {
    if (!profile && !profileLoading) {
      refreshProfile();
    }
  }, [profile, profileLoading, refreshProfile]);

  return (
    <Layout>
      <div className="container mx-auto p-6 mt-16">
        <div className="w-full max-w-4xl mx-auto bg-card shadow-sm rounded-lg p-6">
          <div className="mb-8">
            <ProfileHeader 
              profile={profile} 
              handlePhotoClick={handlePhotoClick} 
              fileInputRef={fileInputRef} 
              handlePhotoChange={handlePhotoChange} 
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profile ? (
              <>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{profile.name || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{profile.email || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Gender</p>
                      <p className="font-medium">{profile.gender || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Birth Date</p>
                      <p className="font-medium">
                        {profile.birthDate ? new Date(profile.birthDate).toLocaleDateString() : 'Not set'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Health Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Height</p>
                      <p className="font-medium">
                        {profile.height ? `${profile.height} ${profile.measurementUnit === 'imperial' ? 'in' : 'cm'}` : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Current Weight</p>
                      <p className="font-medium">
                        {profile.currentWeight ? `${profile.currentWeight} ${profile.measurementUnit === 'imperial' ? 'lbs' : 'kg'}` : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Target Weight</p>
                      <p className="font-medium">
                        {profile.targetWeight ? `${profile.targetWeight} ${profile.measurementUnit === 'imperial' ? 'lbs' : 'kg'}` : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Fitness Level</p>
                      <p className="font-medium">{profile.fitnessLevel || 'Not set'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="col-span-1 md:col-span-2 space-y-4">
                  <h3 className="text-lg font-semibold">Goals</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Weight Loss per Week</p>
                      <p className="font-medium">
                        {profile.weightLossPerWeek ? `${profile.weightLossPerWeek} ${profile.measurementUnit === 'imperial' ? 'lbs' : 'kg'}` : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Exercise Minutes per Day</p>
                      <p className="font-medium">
                        {profile.exerciseMinutesPerDay ? `${profile.exerciseMinutesPerDay} minutes` : 'Not set'}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Health Goals</p>
                      <p className="font-medium">{profile.healthGoals || 'Not set'}</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="col-span-2 text-center py-8">
                <p className="text-muted-foreground">Loading profile information...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
