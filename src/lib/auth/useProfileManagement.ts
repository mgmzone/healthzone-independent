
import { useState } from 'react';
import { User } from '../types';
import { getProfile } from '../services/profileService';

export const useProfileManagement = (userId: string | undefined) => {
  const [profile, setProfile] = useState<User | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const fetchProfile = async () => {
    if (!userId) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    try {
      const profileData = await getProfile();
      
      if (profileData && !profileData.measurementUnit) {
        profileData.measurementUnit = 'imperial';
      }
      
      setProfile(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  return {
    profile,
    profileLoading,
    fetchProfile
  };
};
