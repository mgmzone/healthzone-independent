
import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User } from '../types';
import { isProfileComplete, isAuthOrIndexPage } from './authUtils';

export const useAuthRedirects = (
  loading: boolean,
  profileLoading: boolean,
  user: SupabaseUser | null,
  profile: User | null
) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const redirectProcessedRef = useRef(false);
  const previousAuthState = useRef<boolean | null>(null);

  useEffect(() => {
    // Track auth state changes
    const isAuthenticated = !!user;
    const wasAuthenticated = previousAuthState.current;
    
    // If user transitions from logged in to logged out
    if (wasAuthenticated === true && !isAuthenticated) {
      console.log('Auth state changed from logged in to logged out');
      redirectProcessedRef.current = false;
      // No need to navigate here, we'll let useAuthOperations handle this
    }
    
    // Update previous auth state
    previousAuthState.current = isAuthenticated;
    
    // Only perform redirects if both auth and profile loading are complete
    if (!loading && !profileLoading) {
      console.log('Checking redirects:', { 
        loading, 
        profileLoading, 
        user, 
        profile,
        currentPath,
        profileComplete: profile ? isProfileComplete(profile) : false
      });

      // Only process redirects once per session unless flag is reset
      if (!redirectProcessedRef.current) {
        if (user) {
          // Only proceed if we have both user and profile data
          if (profile) {
            const currentIsProfileComplete = isProfileComplete(profile);
            const currentIsAuthOrIndexPage = isAuthOrIndexPage(currentPath);
            
            console.log('Redirect decision:', {
              currentIsProfileComplete,
              currentIsAuthOrIndexPage,
              currentPath
            });
            
            // If on auth or index page, redirect based on profile completeness
            if (currentIsAuthOrIndexPage) {
              if (currentIsProfileComplete) {
                console.log('Redirecting to dashboard from auth/index page');
                navigate('/dashboard', { replace: true });
              } else {
                console.log('Redirecting to profile page from auth/index page');
                navigate('/profile', { replace: true });
              }
              redirectProcessedRef.current = true;
            } 
            // If not on profile page and profile is incomplete, redirect to profile
            else if (!currentIsProfileComplete && currentPath !== '/profile') {
              console.log('Profile incomplete, redirecting to profile');
              navigate('/profile', { replace: true });
              redirectProcessedRef.current = true;
            }
          } else {
            console.log('Have user but profile not loaded yet, waiting for profile data');
          }
        }
      }
    }
  }, [loading, profileLoading, user, profile, navigate, currentPath]);
};
