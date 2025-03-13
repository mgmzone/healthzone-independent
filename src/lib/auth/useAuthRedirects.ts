
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

  useEffect(() => {
    // Only perform redirects if both auth and profile loading are complete
    // And only process redirects once per auth state change
    if (!loading && !profileLoading && !redirectProcessedRef.current) {
      console.log('Checking redirects:', { 
        loading, 
        profileLoading, 
        user, 
        profile,
        currentPath 
      });

      if (user) {
        const currentIsProfileComplete = isProfileComplete(profile);
        const currentIsAuthOrIndexPage = isAuthOrIndexPage(currentPath);
        
        // If on auth or index page, redirect based on profile completeness
        if (currentIsAuthOrIndexPage) {
          if (currentIsProfileComplete) {
            console.log('Redirecting to dashboard');
            navigate('/dashboard', { replace: true });
          } else {
            console.log('Redirecting to profile page');
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
      }
    }
  }, [loading, profileLoading, user, profile, navigate, currentPath]);

  // Reset the redirect flag when auth state changes
  useEffect(() => {
    redirectProcessedRef.current = false;
  }, [user, profile]);
};
