import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Activity, BarChart, Clock, Heart, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { cn } from '@/lib/utils';

const Index = () => {
  return (
    <Layout transparentHeader hideFooter>
      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-healthzone-950 via-healthzone-900 to-black text-white">
        <div className="absolute inset-0 z-0 opacity-30">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center px-4 py-32 md:py-40 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-block mb-6 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full">
              <span className="text-white/90 text-sm font-medium">Your path to better health starts here</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Track Your Health Journey with <span className="bg-clip-text text-transparent bg-gradient-to-r from-healthzone-300 to-healthzone-500">Precision</span>
            </h1>
            <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto mb-10">
              Monitor your weight loss, intermittent fasting, and exercise routines in one seamless experience. 
              Take control of your health with data-driven insights.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" asChild className="rounded-full px-8 gap-2 text-base">
                <Link to="/signup">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-full px-8 gap-2 text-base bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20">
                <Link to="/login">
                  Log In
                </Link>
              </Button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 w-full max-w-4xl relative"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-xl overflow-hidden">
              <img 
                src="/lovable-uploads/60c42391-c2db-428a-9ed5-4c47de2debd5.png" 
                alt="HealthZone Dashboard Preview" 
                className="w-full h-auto"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 rotate-12 animate-float">
              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl shadow-lg p-3 w-40">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 rounded-full bg-green-400"></div>
                  <span className="text-xs font-medium">Weight Goal</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-[75%] bg-gradient-to-r from-healthzone-400 to-healthzone-600 rounded-full"></div>
                </div>
                <div className="mt-2 text-xs text-right">75% Complete</div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background/90 to-transparent"></div>
      </section>

      {/* Features Section */}
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
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-card border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
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

      {/* Testimonials Section */}
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
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-card border rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white",
                    index % 2 === 0 ? "bg-healthzone-600" : "bg-healthzone-500"
                  )}>
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-medium">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.achievement}</p>
                  </div>
                </div>
                <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 px-4 bg-gradient-to-br from-healthzone-900 via-healthzone-800 to-healthzone-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Health Journey?
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10">
            Join thousands of users who have transformed their health with HealthZone. 
            Sign up today and take the first step towards a healthier you.
          </p>
          <Button size="lg" asChild className="rounded-full px-8 text-base">
            <Link to="/signup">
              Create Your Free Account
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

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

export default Index;
