
import React from 'react';
import { BarChart, Clock, Dumbbell, Heart, Activity, ArrowRight } from 'lucide-react';
import FeatureCard from './FeatureCard';

// Feature data
const features = [
  {
    icon: BarChart,
    title: "Weight Tracking",
    description: "Log your weight, BMI, body fat, and more. Visualize your progress over time with beautiful charts."
  },
  {
    icon: Clock,
    title: "Intermittent Fasting",
    description: "Track your fasting windows and eating periods. Monitor patterns and see how they impact your health."
  },
  {
    icon: Dumbbell,
    title: "Exercise Logging",
    description: "Record workouts, steps, distance, and heart rate. Analyze your activity patterns and improvements."
  },
  {
    icon: Heart,
    title: "Health Metrics",
    description: "Monitor vital statistics like blood pressure and resting heart rate to get a complete health picture."
  },
  {
    icon: Activity,
    title: "Personalized Goals",
    description: "Set custom goals for weight, exercise, and fasting based on your unique health journey."
  },
  {
    icon: ArrowRight,
    title: "Progress Reports",
    description: "Receive detailed insights about your health journey with comprehensive analytics and reports."
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-24 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            All-in-One Health Tracking
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            HealthZone combines essential tracking tools for every aspect of your wellness journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
