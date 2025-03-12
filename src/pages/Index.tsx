
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
      user, 
      profile, 
      loading, 
      profileLoading,
      pathname: location.pathname 
    });
  }, [user, profile, loading, profileLoading, location]);
  
  // Redirect logged-in users appropriately
  useEffect(() => {
    if (!loading && !profileLoading && user) {
      const profileComplete = isProfileComplete(profile);
      
      console.log('Index redirect logic', { 
        profileComplete, 
        profile,
        firstName: profile?.firstName,
        currentWeight: profile?.currentWeight,
        targetWeight: profile?.targetWeight,
        height: profile?.height
      });
      
      navigate(profileComplete ? '/dashboard' : '/getting-started', { replace: true });
    }
  }, [user, profile, loading, profileLoading, navigate]);

  // If user is logged in, don't render the landing page content
  if (loading || profileLoading || user) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
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
