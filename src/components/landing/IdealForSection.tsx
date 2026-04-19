import React from 'react';
import { motion } from 'framer-motion';
import { Target, Clock, Activity, BarChart3 } from 'lucide-react';

// Honest "who this is for" section. Replaces the old testimonials that were
// fabricated. When real quotes from real users exist, they can live in their
// own TestimonialsSection alongside this — this one describes fit.
const personas = [
  {
    icon: Target,
    title: 'People working toward a deadline',
    description:
      'Pre-surgery prep, a wedding, a health milestone — if you need to hit a specific weight by a specific date, HealthZone is built around that constraint.',
  },
  {
    icon: Clock,
    title: 'Serious intermittent fasters',
    description:
      '16:8, 18:6, OMAD. Track eating windows and fast lengths with enough detail to actually learn from them — including which days of the week you drift.',
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
      'You want charts that tell the truth, forecasts that move with reality, and streaks that are not a gimmick. Numbers over vibes.',
  },
];

const IdealForSection = () => {
  return (
    <section className="py-24 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Built for specific goals, not generic wellness
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            HealthZone is most useful if one of these sounds like you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {personas.map((persona, index) => {
            const Icon = persona.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex gap-4 rounded-xl border bg-card p-6"
              >
                <div className="shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{persona.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{persona.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default IdealForSection;
