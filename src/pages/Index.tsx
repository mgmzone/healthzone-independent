import React from 'react';
import { useAuth } from '@/lib/auth';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import MarqueeSection from '@/components/landing/MarqueeSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import ProofSection from '@/components/landing/ProofSection';
import CallToActionSection from '@/components/landing/CallToActionSection';
import LandingFooter from '@/components/landing/LandingFooter';

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  // The landing renders outside <Layout> so it controls its own header
  // (LandingNav inside HeroSection) and footer. Paper background is
  // applied here and its font-sans default shifts to Inter — Fraunces
  // and JetBrains Mono are scoped via font-display / font-mono-ui utilities.
  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink antialiased">
      <main className="flex-1">
        <HeroSection />
        <MarqueeSection />
        <FeaturesSection />
        <ProofSection />
        <HowItWorksSection />
        <CallToActionSection />
      </main>
      <LandingFooter />
    </div>
  );
};

export default Index;
