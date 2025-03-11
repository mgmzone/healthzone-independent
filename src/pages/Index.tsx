
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
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // If user is logged in, don't render the landing page content
  if (user) {
    return null; // Return null while redirecting
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
