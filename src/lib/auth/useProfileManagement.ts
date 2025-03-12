
import { useState, useCallback, useRef, useEffect } from 'react';
import { User } from '../types';
import { getProfile } from '../services/profileService';

export const useProfileManagement = (userId: string | undefined) => {
  const [profile, setProfile] = useState<User | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const isFirstRender = useRef(true);
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
      const profileData = await getProfile();
      
      if (profileData && !profileData.measurementUnit) {
        profileData.measurementUnit = 'imperial';
      }
      
      setProfile(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setProfileLoading(false);
      pendingFetch.current = false;
    }
  }, [userId]);

  // Only fetch on first render or userId change
  useEffect(() => {
    if (isFirstRender.current && userId) {
      isFirstRender.current = false;
      fetchProfile();
    }
  }, [userId, fetchProfile]);

  return {
    profile,
    profileLoading,
    fetchProfile
  };
};
