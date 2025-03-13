
import React, { useEffect, useCallback, useRef } from 'react';
import AuthContext from './AuthContext';
import { useAuthState } from './useAuthState';
import { useProfileManagement } from './useProfileManagement';
import { useAuthOperations } from './useAuthOperations';
import { useAuthRedirects } from './useAuthRedirects';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, session, loading } = useAuthState();
  const { profile, profileLoading, fetchProfile } = useProfileManagement(user?.id);
  const { signUp, signIn, signOut } = useAuthOperations();
  const initialLoadComplete = useRef(false);
  
  // Handle redirects based on auth state
  useAuthRedirects(loading, profileLoading, user, profile);

  // Reset initial load state on logout
  useEffect(() => {
    if (!user) {
      console.log('User logged out, resetting initial load flag');
      initialLoadComplete.current = false;
    }
  }, [user]);

  // Fetch profile when auth state changes and we have a user ID
  useEffect(() => {
    if (!loading && user?.id) {
      console.log('Checking initial profile fetch for user:', user.id);
      // Always fetch profile on login or page refresh for up-to-date info
      if (!initialLoadComplete.current) {
        console.log('Initial profile fetch for user:', user.id);
        initialLoadComplete.current = true;
        fetchProfile();
      }
    }
  }, [loading, user?.id, fetchProfile]);

  // Wrapper for the fetchProfile function to use as refreshProfile
  const refreshProfile = useCallback(async () => {
    console.log('Manual profile refresh requested');
    // We're explicitly refreshing, so fetch regardless of initial load state
    await fetchProfile();
  }, [fetchProfile]);

  const value = {
    session,
    user,
    profile,
    loading,
    profileLoading,
    signUp,
    signIn,
    signOut,
    refreshProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
