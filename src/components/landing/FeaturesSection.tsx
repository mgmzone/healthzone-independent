
import React from 'react';
import {
  Scale,
  Apple,
  Clock,
  TrendingDown,
  Sparkles,
  Flame,
  Dumbbell,
  Calendar,
  BookOpen,
} from 'lucide-react';
import FeatureCard from './FeatureCard';

// Grouped in three thematic rows: core tracking, smart insights, planning.
// If you add a new feature to the app, add its card here so the landing
// page doesn't lie about what's inside.
const features = [
  {
    icon: Scale,
    title: 'Weight Tracking',
    description:
      'Weight, BMI, body fat, muscle, bone, body water. Chart each measure and trust the trend over the noise.',
  },
  {
    icon: Apple,
    title: 'Nutrition & Macros',
    description:
      'Log meals with protein, carbs, fat, sodium, and calories. Track anti-inflammatory choices and dietary irritants if your doctor asked you to.',
  },
  {
    icon: Clock,
    title: 'Intermittent Fasting',
    description:
      'Track fasting and eating windows for 16:8, 18:6, or OMAD protocols. See streaks and spot the days that drift.',
  },
  {
    icon: TrendingDown,
    title: 'Smart Weight Forecast',
    description:
      'A projection that responds to your actual recent pace, not a straight line. The curve flattens approaching target — the way real weight loss behaves.',
  },
  {
    icon: Sparkles,
    title: 'AI Coach',
    description:
      'Claude-powered meal assessments, exercise analysis, and weekly insights from your own data. Plug in your Anthropic API key for full control and privacy.',
  },
  {
    icon: Flame,
    title: 'Streaks & Daily Goals',
    description:
      'Custom daily goals — hydration, supplements, dietary rules — tracked with streaks so consistency becomes the game.',
  },
  {
    icon: Dumbbell,
    title: 'Exercise Logging',
    description:
      'Cardio, resistance, sports, flexibility. Minutes, intensity, heart rate, calories. Strava sync pulls in runs and rides automatically.',
  },
  {
    icon: Calendar,
    title: 'Periods & Milestones',
    description:
      'Structure weight-loss cycles around a target date. Projected completion updates live as your actual pace changes, so you always know if you are on track.',
  },
  {
    icon: BookOpen,
    title: 'Personal Journal',
    description:
      'Free-form daily notes, tagged and searchable. Capture recovery, side effects, or reflections — useful for doctor visits or just future-you.',
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need — and nothing you don't
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Nine focused tools that work together. Track what matters, understand what it means, and see whether you're actually on track.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
