import React from 'react';
import { Target, Clock, Activity, BarChart3 } from 'lucide-react';

// Design-faithful "proof" section but scrubbed of the fabricated
// percentages/testimonials from the original mock. What's here is either
// true, verifiable, or a genuine statement of intent.

const personas = [
  {
    icon: Target,
    title: 'People working toward a deadline',
    description:
      'Pre-surgery prep, a wedding, a health milestone. If you need to hit a specific weight by a specific date, HealthZone is built around that constraint.',
  },
  {
    icon: Clock,
    title: 'Serious intermittent fasters',
    description:
      '16:8, 18:6, OMAD. Eating-window and fast-length data you can actually learn from — including which days of the week you drift.',
  },
  {
    icon: Activity,
    title: 'Medically-guided eaters',
    description:
      'Anti-inflammatory protocols, bladder-irritant avoidance, surgeon-prescribed protein targets. Log compliance day by day and see your pattern over weeks.',
  },
  {
    icon: BarChart3,
    title: 'Data-minded trackers',
    description:
      'Charts that tell the truth. Forecasts that move with reality. Streaks that are not a gimmick. Numbers over vibes.',
  },
];

const honestStats = [
  { n: '0', label: 'Ads, trackers, upsells, or growth funnels.' },
  { n: '1', label: 'Developer. This is a personal project, open to others.' },
  { n: '100', label: 'Percent of your data — yours, exportable any time.' },
  { n: 'Free', label: 'Forever for the core app. No tiers, no credit card.' },
];

const ProofSection: React.FC = () => (
  <section id="who" className="py-24 md:py-32 bg-paper-dark">
    <div className="max-w-[1240px] mx-auto px-7">
      <div className="font-mono-ui text-[11px] uppercase tracking-[0.2em] text-sage mb-3.5">
        Who it&rsquo;s for
      </div>
      <h2
        className="font-display font-normal leading-none m-0 mb-5 max-w-[18ch]"
        style={{ fontSize: 'clamp(40px, 6vw, 76px)', letterSpacing: '-0.03em' }}
      >
        Built for specific goals, not generic <em className="italic text-landing-blue">wellness</em>.
      </h2>
      <p className="text-lg leading-snug text-ink-2 max-w-[600px] m-0">
        HealthZone is most useful if one of these sounds like you.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-7 mt-15 md:mt-[60px] max-w-5xl">
        {personas.map((p, i) => {
          const Icon = p.icon;
          return (
            <div
              key={i}
              className="flex gap-4 rounded-2xl bg-white p-6"
              style={{ border: '1px solid rgba(15,42,45,0.08)' }}
            >
              <div className="shrink-0 w-12 h-12 rounded-xl bg-landing-blue-tint grid place-items-center">
                <Icon className="w-6 h-6 text-landing-blue" strokeWidth={2} />
              </div>
              <div>
                <h3 className="font-display text-xl font-medium m-0 mb-1.5" style={{ letterSpacing: '-0.01em' }}>
                  {p.title}
                </h3>
                <p className="text-sm leading-snug text-ink-2 m-0">{p.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Honest-stats strip — replaces the design's fabricated "94% retention (n=14)" metrics. */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-7 mt-20">
        {honestStats.map((s, i) => (
          <div key={i} className="pt-8" style={{ borderTop: '1px solid rgba(15,42,45,0.14)' }}>
            <div
              className="font-display leading-none font-normal"
              style={{
                fontSize: 'clamp(48px, 5vw, 64px)',
                letterSpacing: '-0.03em',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              <em className="italic text-landing-blue not-italic" style={{ fontStyle: 'italic' }}>
                {s.n}
              </em>
            </div>
            <div className="text-[13px] text-ink-2 mt-2.5 leading-snug">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ProofSection;
