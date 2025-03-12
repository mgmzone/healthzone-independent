
import React, { useState, useEffect } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { User } from '../types';
import { supabase } from '../supabase';
import { getProfile } from '../services/profileService';
import AuthContext from './AuthContext';
import { isProfileComplete, isAuthOrIndexPage } from './authUtils';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

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
    }
  };

  useEffect(() => {
    let isSubscribed = true;

    const initialize = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (isSubscribed) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      if (isSubscribed) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchProfile();
    }
  }, [user, loading]);

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

  const refreshProfile = async () => {
    await fetchProfile();
  };

  const signUp = async (
    email: string, 
    password: string, 
    metadata?: { first_name?: string; last_name?: string }
  ) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });

      if (error) throw error;
      
      toast({
        title: "Sign up successful!",
        description: "Please check your email for a confirmation link.",
      });
    } catch (error: any) {
      toast({
        title: "Error signing up",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      // Do not navigate here - let the redirects in the useEffect handle it
      toast({
        title: "Welcome back!",
        description: "You are now logged in.",
      });
    } catch (error: any) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
      toast({
        title: "Signed out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
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
