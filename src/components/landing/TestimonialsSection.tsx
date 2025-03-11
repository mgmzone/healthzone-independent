
import React from 'react';
import TestimonialCard from './TestimonialCard';

// Testimonials data
const testimonials = [
  {
    name: "Sarah Johnson",
    achievement: "Lost 30 pounds in 6 months",
    quote: "HealthZone made it easy to track my intermittent fasting and see how it affected my weight loss. The visualizations kept me motivated throughout my journey."
  },
  {
    name: "Michael Thompson",
    achievement: "Improved fitness and lowered blood pressure",
    quote: "Being able to track both my exercise and health metrics in one place has been game-changing. I can clearly see how my workouts impact my overall health."
  },
  {
    name: "Emily Rodriguez",
    achievement: "Maintained weight loss for over a year",
    quote: "The period tracking feature helps me set realistic goals. I've been able to maintain my weight loss by transitioning between weight loss and maintenance periods."
  },
  {
    name: "David Chen",
    achievement: "Increased exercise consistency by 80%",
    quote: "The exercise logging and analytics helped me identify patterns and gradually increase my activity. I'm now more consistent than I've ever been."
  }
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 px-4 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Success Stories
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how HealthZone has helped people transform their lives.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              name={testimonial.name}
              achievement={testimonial.achievement}
              quote={testimonial.quote}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
