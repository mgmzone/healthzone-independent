
import React from 'react';
import { motion } from 'framer-motion';

// Three-act framing: set the goal, log the days, read the signal.
const steps = [
  {
    title: 'Set your target and deadline',
    description:
      'Tell HealthZone your starting weight, target weight, and the date you want to hit it. Pick your fasting protocol and define the daily compliance goals that matter for your plan.',
  },
  {
    title: 'Log the days',
    description:
      'Weigh-ins, meals, workouts, fasting windows, and journal notes. The AI coach can estimate macros and assess meals against your goals when you want a second opinion.',
  },
  {
    title: 'See whether you are on track',
    description:
      'Smart forecasts show your projected completion date based on real recent pace — not wishful thinking. Streaks, weekly summaries, and charts tell you what is actually working.',
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-24 px-4 bg-secondary/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How it works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three acts: set the goal, log the days, read the signal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 mb-6 rounded-full bg-primary flex items-center justify-center mx-auto">
                <span className="text-xl font-bold text-primary-foreground">{index + 1}</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
