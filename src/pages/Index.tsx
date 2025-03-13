
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/lib/auth';
import { isProfileComplete } from '@/lib/auth';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import CallToActionSection from '@/components/landing/CallToActionSection';

const Index = () => {
  const { user, profile, loading, profileLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Add console log for debugging
  useEffect(() => {
    console.log('Index page loaded', { 
      user: user?.id, 
      profile: profile?.firstName, 
      profileComplete: profile ? isProfileComplete(profile) : false,
      loading, 
      profileLoading,
      pathname: location.pathname 
    });
  }, [user, profile, loading, profileLoading, location]);
  
  // Show loading state while auth and profile are being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is already logged in, don't render the landing page content
  // but let the auth redirects handle navigation
  if (user) {
    return null;
  }

  return (
    <Layout transparentHeader hideFooter>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <CallToActionSection />
    </Layout>
  );
};

export default Index;
