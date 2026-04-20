import React from 'react';
import { Target, Pencil, TrendingDown } from 'lucide-react';

const steps = [
  {
    icon: Target,
    num: 'Step 01',
    title: 'Set one period.',
    description:
      'Pick a start weight, a target, and a finish date. The app does the math — weekly pace, forecast, milestones, daily compliance goals.',
    tint: 'bg-landing-blue-tint',
    stroke: 'text-landing-blue',
  },
  {
    icon: Pencil,
    num: 'Step 02',
    title: 'Log four things.',
    description:
      'Weight once a day. Fasting window. Meals by protein. Any movement. Journal if something felt off. Takes under two minutes total.',
    tint: 'bg-sage-tint',
    stroke: 'text-sage',
  },
  {
    icon: TrendingDown,
    num: 'Step 03',
    title: 'Read the line.',
    description:
      "By day four, your trend line shows up. The noise fades, the signal shows, you adjust. That's the whole game.",
    tint: 'bg-amber-tint',
    stroke: 'text-amber',
  },
];

const HowItWorksSection: React.FC = () => (
  <section id="how" className="pt-10 pb-24 md:pb-32">
    <div className="max-w-[1240px] mx-auto px-7">
      <div className="font-mono-ui text-[11px] uppercase tracking-[0.2em] text-sage mb-3.5">
        How it works · in under a minute
      </div>
      <h2
        className="font-display font-normal leading-none m-0 mb-5 max-w-[18ch]"
        style={{ fontSize: 'clamp(40px, 6vw, 76px)', letterSpacing: '-0.03em' }}
      >
        Start Monday. See real data by <em className="italic text-landing-blue">Friday</em>.
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-15 md:mt-[60px]">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div
              key={i}
              className="relative p-7 md:p-8 rounded-[20px] bg-white transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-16px_rgba(15,42,45,0.12)]"
              style={{ border: '1px solid rgba(15,42,45,0.08)' }}
            >
              <div className={`mb-3.5 w-11 h-11 rounded-xl ${step.tint} grid place-items-center`}>
                <Icon className={`w-5 h-5 ${step.stroke}`} strokeWidth={2} />
              </div>
              <div className="font-mono-ui text-[11px] uppercase tracking-[0.2em] text-sage mb-5">
                {step.num}
              </div>
              <h4
                className="font-display text-[28px] font-medium leading-tight m-0 mb-2.5"
                style={{ letterSpacing: '-0.01em' }}
              >
                {step.title}
              </h4>
              <p className="text-sm leading-snug text-ink-2 m-0">{step.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export default HowItWorksSection;
