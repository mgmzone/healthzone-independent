
import { useState, useCallback, useRef, useEffect } from 'react';
import { User } from '../types';
import { getProfile } from '../services/profileService';

export const useProfileManagement = (userId: string | undefined) => {
  const [profile, setProfile] = useState<User | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const prevUserId = useRef<string | undefined>(undefined);
  const pendingFetch = useRef(false);

  const fetchProfile = useCallback(async () => {
    // Skip if we're already fetching or if no userId
    if (pendingFetch.current || !userId) {
      if (!userId) {
        setProfile(null);
        setProfileLoading(false);
      }
      return;
    }

    pendingFetch.current = true;
    setProfileLoading(true);
    
    try {
      console.log('Fetching profile for user:', userId);
      const profileData = await getProfile();
      
      if (profileData && !profileData.measurementUnit) {
        profileData.measurementUnit = 'imperial';
      }
      
      setProfile(profileData);
      console.log('Profile fetched successfully:', profileData?.firstName);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    } finally {
      setProfileLoading(false);
      pendingFetch.current = false;
    }
  }, [userId]);

  // Fetch when userId changes
  useEffect(() => {
    if (userId !== prevUserId.current) {
      prevUserId.current = userId;
      fetchProfile();
    }
  }, [userId, fetchProfile]);

  return {
    profile,
    profileLoading,
    fetchProfile
  };
};
