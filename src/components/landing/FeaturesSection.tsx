import React from 'react';
import { Check } from 'lucide-react';

// Editorial numbered feature rows (design's 01-06 pattern).
// 6 rows chosen for visual rhythm; features that don't get their own row
// (AI Coach, Daily Compliance Goals) appear as bullets on the rows where
// they're most relevant, so nothing real gets dropped.

interface Feature {
  number: string;
  title: React.ReactNode;
  description: string;
  tag: string;
  bullets: string[];
}

const features: Feature[] = [
  {
    number: '01',
    title: <><em>Weight</em> — tracked daily, forecast honestly.</>,
    description:
      "Log once a day. An exponential-decay forecast uses your actual recent pace — not a straight line — and flattens as you approach your target. It tells you the truth, even when the truth is that you're behind.",
    tag: 'Includes',
    bullets: ['BMI, body fat, lean mass', 'Regression-based projection', 'Imperial or metric'],
  },
  {
    number: '02',
    title: <><em>Fasting</em> windows, held without willpower.</>,
    description:
      "16:8, 18:6, OMAD, or your own. Start when you finish your last bite; close when you break your fast. A ring shows where you are — that's it.",
    tag: 'Tracks',
    bullets: ['Eating window open/close', 'Streaks you can actually see', 'Average fast length'],
  },
  {
    number: '03',
    title: <><em>Meals</em> — by protein, with an AI coach when you want it.</>,
    description:
      'Counting calories is a lie most days. Hitting protein is the single best predictor of keeping muscle while you lose fat. Log meals in seconds; optionally bring your own Claude API key and let the AI score the meal against your goals.',
    tag: 'Daily',
    bullets: [
      'Protein / carb / fat / calorie targets',
      'Claude-powered meal assessment (optional)',
      'Anti-inflammatory &amp; irritant tagging',
    ],
  },
  {
    number: '04',
    title: <><em>Movement</em> that matches your reality.</>,
    description:
      "Walking counts. Lifting counts. Steps, minutes, heart rate — just log what you actually did. The app won't shame you into running. Strava sync pulls in what Strava knows.",
    tag: 'Logs',
    bullets: ['Cardio, resistance, sports, flexibility', 'Strava sync for runs &amp; rides', 'Weekly target, not daily'],
  },
  {
    number: '05',
    title: <><em>Periods</em> — phases with deadlines, not endless tracking.</>,
    description:
      'Set a target weight and a date. The app does the math — weekly pace, projected completion, milestones. Define custom daily compliance goals (hydration, supplements, medical rules) and streak-track them alongside the numbers.',
    tag: 'Phases',
    bullets: [
      'Weight-loss &amp; maintenance cycles',
      'Configurable milestones',
      'Daily compliance streaks',
    ],
  },
  {
    number: '06',
    title: <><em>Journal</em> — the part nobody else has.</>,
    description:
      'A line a day: how you felt, what worked, what side effects showed up. Tagged, searchable, exportable. This is where you notice the pattern that moves you from "trying" to "doing" — and what you bring to your next doctor visit.',
    tag: 'Includes',
    bullets: ['Free-form daily notes', 'Tags &amp; full-text search', 'Optional pain &amp; mood scales'],
  },
];

const FeatureRow: React.FC<{ feature: Feature; isLast: boolean }> = ({ feature, isLast }) => (
  <div
    className={`group grid grid-cols-1 md:grid-cols-[180px_1.2fr_1fr] gap-6 md:gap-10 py-11 items-start ${
      isLast ? 'border-b' : ''
    } border-t`}
    style={{ borderColor: 'rgba(15,42,45,0.14)' }}
  >
    <div
      className="font-display text-[52px] md:text-7xl font-normal leading-none text-ink-3 transition-colors group-hover:text-sage"
      style={{ letterSpacing: '-0.03em' }}
    >
      <em>{feature.number}</em>
    </div>
    <div>
      <h3
        className="font-display text-[30px] md:text-[40px] font-normal leading-[1.05] m-0 mb-3 [&_em]:italic [&_em]:text-landing-blue"
        style={{ letterSpacing: '-0.02em' }}
      >
        {feature.title}
      </h3>
      <p className="text-base leading-relaxed text-ink-2 m-0">{feature.description}</p>
    </div>
    <div className="flex flex-col gap-2.5">
      <div className="font-mono-ui text-[10px] uppercase tracking-[0.15em] text-sage mb-1.5">
        {feature.tag}
      </div>
      {feature.bullets.map((b, i) => (
        <div key={i} className="flex gap-2.5 items-start text-sm text-ink-2 leading-snug">
          <Check className="w-4 h-4 text-sage flex-shrink-0 mt-0.5" />
          <span dangerouslySetInnerHTML={{ __html: b }} />
        </div>
      ))}
    </div>
  </div>
);

const FeaturesSection: React.FC = () => (
  <section id="features" className="py-24 md:py-32">
    <div className="max-w-[1240px] mx-auto px-7">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end mb-16">
        <div>
          <div className="font-mono-ui text-[11px] uppercase tracking-[0.2em] text-sage mb-3.5">
            Features · 006
          </div>
          <h2
            className="font-display font-normal leading-none m-0 mb-5 max-w-[18ch]"
            style={{
              fontSize: 'clamp(40px, 6vw, 76px)',
              letterSpacing: '-0.03em',
            }}
          >
            One honest tool for <em className="italic text-landing-blue">every</em> lever.
          </h2>
        </div>
        <p className="text-lg leading-snug text-ink-2 max-w-[600px] m-0">
          Six features, tracked next to each other so you can see how they interact. No vanity metrics,
          no dopamine loops — just the inputs that actually move the needle.
        </p>
      </div>

      <div>
        {features.map((f, i) => (
          <FeatureRow key={f.number} feature={f} isLast={i === features.length - 1} />
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
