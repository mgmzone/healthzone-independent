
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
        
        if (currentIsAuthOrIndexPage && !currentIsProfileComplete) {
          console.log('Redirecting to getting-started');
          navigate('/getting-started', { replace: true });
          redirectProcessedRef.current = true;
        } else if (currentIsAuthOrIndexPage && currentIsProfileComplete) {
          console.log('Redirecting to dashboard');
          navigate('/dashboard', { replace: true });
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
