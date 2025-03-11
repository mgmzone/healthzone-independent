
import React from 'react';
import { motion } from 'framer-motion';

// Steps data
const steps = [
  {
    title: "Create Your Profile",
    description: "Set up your personal profile with your health metrics, preferences, and goals."
  },
  {
    title: "Log Your Progress",
    description: "Record your weight, fasting periods, and exercise routines with our intuitive trackers."
  },
  {
    title: "Track & Analyze",
    description: "Monitor your progress over time with detailed charts and personalized insights."
  }
];

const HowItWorksSection = () => {
  return (
    <section className="py-24 px-4 bg-secondary/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How HealthZone Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our simple process helps you stay on track with your health goals.
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
