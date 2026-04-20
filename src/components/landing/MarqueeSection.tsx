import React from 'react';

// Continuously-scrolling metric strip. Duplicates the content list so the
// translateX loop reads seamlessly. Decorative — aria-hidden.

const METRICS = [
  { label: 'weight', value: '187.4', unit: 'lbs' },
  { label: 'fasting', value: '16:24' },
  { label: 'protein', value: '145g', sage: true },
  { label: 'streak', value: '21', unit: 'days' },
  { label: 'period', value: 'week 5/12' },
  { label: 'meals', value: '3/3' },
];

const MarqueeSection: React.FC = () => {
  const doubled = [...METRICS, ...METRICS];
  return (
    <div
      className="relative py-11 mt-10 overflow-hidden bg-paper-dark"
      style={{
        borderTop: '1px solid rgba(15,42,45,0.08)',
        borderBottom: '1px solid rgba(15,42,45,0.08)',
      }}
      aria-hidden="true"
    >
      <div
        className="flex gap-[70px] items-center w-max"
        style={{ animation: 'landing-marquee 44s linear infinite' }}
      >
        {doubled.map((m, i) => (
          <div
            key={i}
            className="flex items-baseline gap-2.5 font-display text-4xl font-normal text-ink whitespace-nowrap"
            style={{ letterSpacing: '-0.02em' }}
          >
            <em className="font-mono-ui text-[11px] uppercase tracking-[0.2em] text-ink-3 not-italic font-normal">
              {m.label}
            </em>
            <b className={`italic font-normal ${m.sage ? 'text-sage' : 'text-landing-blue'}`}>
              {m.value}
              {m.unit && (
                <em className="font-mono-ui text-[11px] uppercase tracking-[0.2em] text-ink-3 not-italic font-normal ml-2">
                  {m.unit}
                </em>
              )}
            </b>
          </div>
        ))}
      </div>

      {/* Edge fades */}
      <div
        className="absolute top-0 bottom-0 left-0 w-[120px] z-[2] pointer-events-none"
        style={{ background: 'linear-gradient(90deg, #F2EDE0, transparent)' }}
      />
      <div
        className="absolute top-0 bottom-0 right-0 w-[120px] z-[2] pointer-events-none"
        style={{ background: 'linear-gradient(-90deg, #F2EDE0, transparent)' }}
      />

      <style>{`
        @keyframes landing-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default MarqueeSection;
