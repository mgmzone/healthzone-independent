
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

  // Fetch profile only when auth state first changes
  useEffect(() => {
    if (!loading && user?.id && !initialLoadComplete.current) {
      initialLoadComplete.current = true;
      fetchProfile();
    }
  }, [loading, user?.id, fetchProfile]);

  // Wrapper for the fetchProfile function to use as refreshProfile
  const refreshProfile = useCallback(async () => {
    // Clear the initial load flag when manually refreshing
    initialLoadComplete.current = false;
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
