import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import LivePreview from './LivePreview';

// Inlines the landing-only sticky nav so we don't fight with the app's
// Header component (which belongs to the authenticated experience).

const LandingNav: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur-lg backdrop-saturate-[1.1] transition-[border-color] duration-200 ${
        scrolled ? 'border-b border-ink/10' : 'border-b border-transparent'
      }`}
      style={{ backgroundColor: 'rgba(250,247,240,0.75)' }}
    >
      <div className="max-w-[1240px] mx-auto px-7 py-4 flex items-center gap-7">
        <Link to="/" className="font-display text-[26px] font-medium text-landing-teal leading-none" style={{ letterSpacing: '-0.02em' }}>
          health<em className="italic font-normal text-landing-blue">zone</em>
        </Link>
        <nav className="hidden md:flex gap-7 ml-5 text-sm text-ink-2">
          <a href="#features" className="hover:text-ink transition-colors">Features</a>
          <a href="#how" className="hover:text-ink transition-colors">How it works</a>
          <a href="#who" className="hover:text-ink transition-colors">Who it&rsquo;s for</a>
        </nav>
        <div className="flex-1" />
        <Link to="/auth" className="px-4 py-2 rounded-full text-sm text-ink-2 hover:text-ink transition-colors">
          Log in
        </Link>
        <Link
          to="/auth?tab=signup"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold bg-ink text-paper hover:bg-landing-teal transition-all hover:-translate-y-0.5"
        >
          Start tracking <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
};

const HeroSection: React.FC = () => {
  return (
    <>
      <LandingNav />
      <section className="relative pt-[120px] pb-20 overflow-hidden">
        {/* Soft radial washes */}
        <div
          className="absolute inset-x-[-20%] top-[-10%] h-[720px] z-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(50% 50% at 15% 30%, rgba(219,241,247,0.8), transparent 60%),
              radial-gradient(40% 40% at 80% 20%, rgba(250,234,215,0.7), transparent 60%),
              radial-gradient(45% 50% at 60% 85%, rgba(227,240,218,0.7), transparent 60%)
            `,
          }}
        />

        <div className="relative z-[2] max-w-[1240px] mx-auto px-7">
          <div className="grid grid-cols-1 md:grid-cols-[1.05fr_1fr] gap-12 items-center">
            <div>
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 font-mono-ui text-[11px] uppercase tracking-[0.18em] text-sage px-3.5 py-1.5 rounded-full bg-sage-tint border border-sage/20 mb-7">
                <span className="w-1.5 h-1.5 rounded-full bg-sage shadow-[0_0_10px_rgba(79,157,95,0.6)]" />
                Now in open beta
              </div>

              <h1
                className="font-display font-normal m-0 mb-3.5 max-w-[12ch]"
                style={{
                  fontSize: 'clamp(52px, 8.8vw, 124px)',
                  lineHeight: 0.92,
                  letterSpacing: '-0.035em',
                }}
              >
                <span className="block">Track</span>
                <span className="block italic text-landing-blue relative">
                  <span className="relative inline-block">
                    truly.
                    <span
                      className="absolute left-[-0.05em] right-[-0.05em] bottom-[0.1em] h-[0.09em] bg-sage rounded-full opacity-40 -z-10"
                      aria-hidden="true"
                    />
                  </span>
                </span>
              </h1>

              <p className="text-lg leading-relaxed text-ink-2 max-w-[560px] my-5 mb-9">
                Hit your weight goal by a specific date. Weight, fasting, meals, movement — one honest number per day, not twelve. Built for the slow work of{' '}
                <em className="text-sage font-display text-[1.08em] font-medium not-italic" style={{ fontStyle: 'italic' }}>
                  actually changing
                </em>
                .
              </p>

              <div className="flex gap-3 items-center flex-wrap">
                <Link
                  to="/auth?tab=signup"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5"
                  style={{ backgroundColor: '#0891B8' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#076583')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0891B8')}
                >
                  Start free <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#preview"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full text-[15px] font-medium text-ink border border-ink/20 hover:bg-ink/5 transition-all hover:-translate-y-0.5"
                >
                  See it in action
                </a>
              </div>

              <div className="mt-5 flex gap-5 text-[13px] text-ink-3 items-center flex-wrap">
                <span className="inline-flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-sage" />
                  Free forever
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-sage" />
                  No credit card
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-sage" />
                  Imperial &amp; metric
                </span>
              </div>
            </div>

            <div id="preview">
              <LivePreview />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HeroSection;
