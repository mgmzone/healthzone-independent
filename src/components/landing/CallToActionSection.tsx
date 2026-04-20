import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CallToActionSection: React.FC = () => (
  <section
    className="py-28 md:py-36 text-center relative overflow-hidden"
    style={{
      background:
        'radial-gradient(50% 60% at 50% 50%, rgba(219,241,247,0.7), transparent 70%), #FAF7F0',
    }}
  >
    <div className="max-w-[1240px] mx-auto px-7 relative">
      <div className="font-mono-ui text-[11px] uppercase tracking-[0.2em] text-sage mb-3.5">
        Ready when you are
      </div>
      <h2
        className="font-display font-normal leading-[0.95] m-0 mb-7"
        style={{ fontSize: 'clamp(48px, 7.6vw, 100px)', letterSpacing: '-0.035em' }}
      >
        Stop tracking for <em className="italic text-landing-blue">points.</em>
        <br />
        Start tracking for <em className="italic text-landing-blue">truth.</em>
      </h2>
      <p className="text-lg text-ink-2 max-w-[540px] mx-auto mb-9 leading-snug">
        Free, forever. No credit card. Your data is yours — exportable any time, deletable any time.
      </p>
      <div className="flex gap-3 justify-center flex-wrap">
        <Link
          to="/auth?tab=signup"
          className="inline-flex items-center gap-2 px-7 py-4 rounded-full text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5"
          style={{ backgroundColor: '#4F9D5F' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#3E7F4B')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4F9D5F')}
        >
          Create your free account <ArrowRight className="w-4 h-4" />
        </Link>
        <a
          href="#features"
          className="inline-flex items-center gap-2 px-7 py-4 rounded-full text-[15px] font-medium text-ink border border-ink/20 hover:bg-ink/5 transition-all hover:-translate-y-0.5"
        >
          Explore the features first
        </a>
      </div>
    </div>
  </section>
);

export default CallToActionSection;
