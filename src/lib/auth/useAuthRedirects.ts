
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

  useEffect(() => {
    if (!loading && !profileLoading) {
      const currentPath = window.location.pathname;
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
        } else if (currentIsAuthOrIndexPage && currentIsProfileComplete) {
          console.log('Redirecting to dashboard');
          navigate('/dashboard', { replace: true });
        }
      }
    }
  }, [loading, profileLoading, user, profile, navigate]);
};
