import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Scale, Timer, Flame, UtensilsCrossed } from 'lucide-react';

// Animated dashboard preview that sits in the hero. Replaces the old
// static screenshot collage. Everything is synthetic but shaped to match
// the real dashboard's cards — a weight sparkline, a fasting progress
// ring that ticks, and a protein-streak chip.

const SPARK_W = 280;
const SPARK_H = 60;

function useSparklinePath() {
  return useMemo(() => {
    const points: number[] = [];
    let base = 208;
    for (let i = 0; i < 30; i++) {
      base -= 0.7 + Math.random() * 0.2;
      const noise = (Math.random() - 0.5) * 1.8;
      points.push(base + noise);
    }
    const min = Math.min(...points);
    const max = Math.max(...points);
    const scaleY = (v: number) =>
      SPARK_H - 4 - ((v - min) / (max - min || 1)) * (SPARK_H - 8);
    const scaleX = (i: number) => (i / (points.length - 1)) * SPARK_W;

    let line = `M ${scaleX(0)} ${scaleY(points[0])}`;
    for (let i = 1; i < points.length; i++) {
      const x0 = scaleX(i - 1);
      const y0 = scaleY(points[i - 1]);
      const x1 = scaleX(i);
      const y1 = scaleY(points[i]);
      const cx = (x0 + x1) / 2;
      line += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
    }
    const lastX = scaleX(points.length - 1);
    const lastY = scaleY(points[points.length - 1]);
    return {
      line,
      area: `${line} L ${SPARK_W} ${SPARK_H} L 0 ${SPARK_H} Z`,
      dot: { x: lastX, y: lastY },
    };
  }, []);
}

// Ticks the fasting clock forward one minute every ~3.5s so the preview
// feels alive without being distracting.
function useFastingTick(startMinutes: number) {
  const [minutes, setMinutes] = useState(startMinutes);
  const ref = useRef(startMinutes);
  ref.current = minutes;
  useEffect(() => {
    const id = window.setInterval(() => {
      setMinutes((m) => (m + 1) % (24 * 60));
    }, 3500);
    return () => window.clearInterval(id);
  }, []);
  const hh = Math.floor(minutes / 60).toString().padStart(2, '0');
  const mm = (minutes % 60).toString().padStart(2, '0');
  const progress = Math.min(1, minutes / (16 * 60));
  return { label: `${hh}:${mm}`, progress };
}

const LivePreview: React.FC = () => {
  const spark = useSparklinePath();
  const { label: fastLabel, progress: fastProgress } = useFastingTick(16 * 60 + 24);
  const ringCircumference = 2 * Math.PI * 33;

  return (
    <div
      className="relative w-full aspect-[4/3.2] rounded-3xl overflow-hidden bg-white p-7"
      style={{
        border: '1px solid rgba(15,42,45,0.14)',
        boxShadow:
          '0 40px 80px -30px rgba(15,42,45,0.25), 0 4px 20px rgba(15,42,45,0.06)',
      }}
    >
      {/* Soft top-left wash */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(40% 30% at 10% 0%, rgba(219,241,247,0.4), transparent 60%)',
        }}
      />

      {/* Live indicator */}
      <div className="absolute top-4 right-4 z-[5] flex items-center gap-1.5 font-mono-ui text-[10px] uppercase tracking-[0.2em] text-sage">
        <span className="w-[7px] h-[7px] rounded-full bg-sage animate-pulse shadow-[0_0_10px_theme(colors.sage.DEFAULT)]" />
        Live
      </div>

      {/* Header strip */}
      <div className="relative z-[2] flex items-center justify-between mb-5">
        <div className="font-mono-ui text-[10px] uppercase tracking-[0.18em] text-ink-3">
          Dashboard · Week 5 of 12
        </div>
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sage" />
          <span className="w-2 h-2 rounded-full bg-ink/10" />
          <span className="w-2 h-2 rounded-full bg-ink/10" />
        </div>
      </div>

      {/* Grid */}
      <div className="relative z-[2] grid grid-cols-[1.3fr_1fr] gap-4">
        {/* Weight card — spans both rows */}
        <div
          className="row-span-2 rounded-2xl p-5"
          style={{
            background: 'var(--landing-blue-tint, #DBF1F7)',
            border: '1px solid rgba(8,145,184,0.15)',
          }}
        >
          <div className="font-mono-ui text-[9px] uppercase tracking-[0.2em] text-ink-3 mb-2.5 flex items-center gap-1.5">
            <Scale className="w-3 h-3" />
            Weight
          </div>
          <div
            className="font-display text-[46px] leading-none font-medium text-ink"
            style={{ letterSpacing: '-0.025em', fontVariantNumeric: 'tabular-nums' }}
          >
            187.4
            <span className="font-sans text-sm text-ink-3 ml-1.5 font-normal">
              lbs
            </span>
          </div>
          <div className="text-xs text-ink-2 mt-1.5 flex items-center gap-1.5">
            <span className="text-sage font-semibold">▼ 21.0 lbs</span> since Jan 8
          </div>
          <svg
            className="mt-3.5 h-[52px] w-full block"
            viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="sparkFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#0891B8" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#0891B8" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={spark.area} fill="url(#sparkFill)" opacity="0.45" />
            <path d={spark.line} stroke="#0891B8" strokeWidth="1.8" fill="none" />
            <circle cx={spark.dot.x} cy={spark.dot.y} r="3.5" fill="#0891B8" stroke="#FFF" strokeWidth="2" />
          </svg>
        </div>

        {/* Fasting ring */}
        <div
          className="rounded-2xl p-4 flex items-center gap-3.5"
          style={{ background: '#FAF7F0', border: '1px solid rgba(15,42,45,0.08)' }}
        >
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="40" cy="40" r="33" fill="none" stroke="rgba(15,42,45,0.08)" strokeWidth="6" />
              <circle
                cx="40"
                cy="40"
                r="33"
                fill="none"
                stroke="#E08A3C"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringCircumference * (1 - fastProgress)}
                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
              />
            </svg>
            <div className="absolute inset-0 grid place-items-center text-center">
              <div>
                <b
                  className="block font-display text-lg font-medium text-ink"
                  style={{ letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' }}
                >
                  {fastLabel}
                </b>
                <span className="block font-mono-ui text-[9px] uppercase tracking-[0.15em] text-ink-3">
                  FAST
                </span>
              </div>
            </div>
          </div>
          <div className="min-w-0">
            <div className="font-mono-ui text-[9px] uppercase tracking-[0.2em] text-ink-3 mb-1.5 flex items-center gap-1.5">
              <Timer className="w-[11px] h-[11px]" />
              Fasting 16:8
            </div>
            <div className="text-xs text-ink-2 leading-snug">
              Opens at
              <br />
              <b className="text-ink font-display text-base font-medium">12:30 PM</b>
            </div>
          </div>
        </div>

        {/* Protein card */}
        <div
          className="rounded-2xl p-4"
          style={{ background: '#FAF7F0', border: '1px solid rgba(15,42,45,0.08)' }}
        >
          <div className="font-mono-ui text-[9px] uppercase tracking-[0.2em] text-ink-3 mb-2 flex items-center gap-1.5">
            <Flame className="w-3 h-3" />
            Protein
          </div>
          <div
            className="font-display text-[32px] leading-none font-medium text-ink"
            style={{ letterSpacing: '-0.025em', fontVariantNumeric: 'tabular-nums' }}
          >
            145
            <span className="font-sans text-sm text-ink-3 ml-1.5 font-normal">g / 160</span>
          </div>
          <div
            className="mt-3 flex items-center gap-2.5 px-3 py-2.5 rounded-[10px]"
            style={{ background: '#FAEAD7', border: '1px solid rgba(224,138,60,0.22)' }}
          >
            <UtensilsCrossed className="w-4 h-4 text-amber flex-shrink-0" />
            <div>
              <b className="font-display text-xl font-medium text-amber leading-none">12</b>
              <div className="font-mono-ui text-[10px] uppercase tracking-[0.1em] text-ink-3 leading-tight">
                day streak
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivePreview;
