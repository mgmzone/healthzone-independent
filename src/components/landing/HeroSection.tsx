
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
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
            Monitor your weight loss, intermittent fasting, and exercise goals in one seamless experience. 
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
          className="mt-20 w-full max-w-5xl relative"
        >
          <div className="relative h-[500px] md:h-[600px]">
            {/* Dashboard screenshot */}
            <div className="absolute top-0 left-0 md:left-[5%] w-[85%] md:w-[60%] transform hover:scale-105 transition-transform duration-300 z-30">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-xl overflow-hidden">
                <img 
                  src="/lovable-uploads/7b18d2b6-0817-4015-afa4-f01258d4834d.png" 
                  alt="HealthZone Dashboard" 
                  className="w-full h-auto"
                />
              </div>
            </div>
            
            {/* Weight tracker screenshot */}
            <div className="absolute top-[15%] right-0 md:right-[5%] w-[80%] md:w-[55%] transform hover:scale-105 transition-transform duration-300 z-20">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-xl overflow-hidden">
                <img 
                  src="/lovable-uploads/7f41436f-32b9-4195-91c5-f74ebe845cef.png" 
                  alt="HealthZone Weight Tracker" 
                  className="w-full h-auto"
                />
              </div>
            </div>
            
            {/* Fasting tracker screenshot */}
            <div className="absolute top-[35%] left-[10%] md:left-[15%] w-[80%] md:w-[55%] transform hover:scale-105 transition-transform duration-300 z-10">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-xl overflow-hidden">
                <img 
                  src="/lovable-uploads/99799d8c-1a79-4982-9c46-22e3fbe44e9f.png" 
                  alt="HealthZone Fasting Tracker" 
                  className="w-full h-auto"
                />
              </div>
            </div>
            
            {/* Exercise tracker screenshot */}
            <div className="absolute top-[50%] right-[5%] md:right-[10%] w-[75%] md:w-[50%] transform hover:scale-105 transition-transform duration-300 z-0">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-xl overflow-hidden">
                <img 
                  src="/lovable-uploads/6b224319-b5c3-413e-9c54-f33b93b52bbc.png" 
                  alt="HealthZone Exercise Tracker" 
                  className="w-full h-auto"
                />
              </div>
            </div>
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
  );
};

export default HeroSection;
