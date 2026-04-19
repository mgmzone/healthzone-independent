import React from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/lib/auth';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import IdealForSection from '@/components/landing/IdealForSection';
import CallToActionSection from '@/components/landing/CallToActionSection';

const Index = () => {
  const { user, loading } = useAuth();

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
      <IdealForSection />
      <HowItWorksSection />
      <CallToActionSection />
    </Layout>
  );
};

export default Index;
