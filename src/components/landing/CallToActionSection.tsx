
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const CallToActionSection = () => {
  return (
    <section className="py-24 px-4 bg-gradient-to-br from-healthzone-900 via-healthzone-800 to-healthzone-900 text-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Ready to hit your target?
        </h2>
        <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10">
          HealthZone is free to sign up. Plug in your goal date, start logging, and let the forecast tell you whether you are actually on track.
        </p>
        <Button size="lg" asChild className="rounded-full px-8 text-base">
          <Link to="/auth?tab=signup">
            Create your free account
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default CallToActionSection;
