
import React, { useEffect } from 'react';
import AuthContext from './AuthContext';
import { useAuthState } from './useAuthState';
import { useProfileManagement } from './useProfileManagement';
import { useAuthOperations } from './useAuthOperations';
import { useAuthRedirects } from './useAuthRedirects';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, session, loading } = useAuthState();
  const { profile, profileLoading, fetchProfile } = useProfileManagement(user?.id);
  const { signUp, signIn, signOut } = useAuthOperations();
  
  // Handle redirects based on auth state
  useAuthRedirects(loading, profileLoading, user, profile);

  // Fetch profile when auth state changes
  useEffect(() => {
    if (!loading) {
      fetchProfile();
    }
  }, [user, loading]);

  // Wrapper for the fetchProfile function to use as refreshProfile
  const refreshProfile = async () => {
    await fetchProfile();
  };

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
