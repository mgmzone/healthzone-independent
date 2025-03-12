
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useAuth } from '@/lib/AuthContext';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import CallToActionSection from '@/components/landing/CallToActionSection';

const Index = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  // Redirect logged-in users appropriately
  useEffect(() => {
    if (user) {
      const isProfileComplete = profile?.firstName && 
        profile?.currentWeight && 
        profile?.targetWeight && 
        profile?.height;
      
      navigate(isProfileComplete ? '/dashboard' : '/getting-started', { replace: true });
    }
  }, [user, profile, navigate]);

  // If user is logged in, don't render the landing page content
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
