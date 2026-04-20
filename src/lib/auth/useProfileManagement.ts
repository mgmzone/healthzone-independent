
import { useState, useCallback, useRef, useEffect } from 'react';
import { User } from '../types';
import { getProfile, updateProfile } from '../services/profileService';
import { detectBrowserTimeZone } from '../timeZones';

// One-shot guard so we only try to auto-set the timezone once per page load.
// Without it, a retry on fetch (e.g. profile refresh after a save) could
// stomp on a user's explicit timezone choice if their browser reports
// something different than what they picked.
const tzAutoDetectAttempted = new Set<string>();

export const useProfileManagement = (userId: string | undefined) => {
  const [profile, setProfile] = useState<User | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const prevUserId = useRef<string | undefined>(undefined);
  const pendingFetch = useRef(false);

  const fetchProfile = useCallback(async () => {
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

      // Auto-detect the browser timezone the first time we see a profile
      // whose timezone is still the DB default ('UTC'). New users never
      // want UTC; without this, the daily-reminder cron fires at 8 PM UTC
      // (3-4 PM Eastern) before they realize they need to update Profile.
      if (profileData && profileData.timeZone === 'UTC' && !tzAutoDetectAttempted.has(userId)) {
        tzAutoDetectAttempted.add(userId);
        const browserTz = detectBrowserTimeZone();
        if (browserTz && browserTz !== 'UTC') {
          try {
            await updateProfile({ timeZone: browserTz });
            profileData.timeZone = browserTz;
          } catch (err) {
            // Non-fatal — user can still set it manually on Profile page.
            console.error('Failed to auto-set time zone:', err);
          }
        }
      }

      setProfile(profileData);
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
