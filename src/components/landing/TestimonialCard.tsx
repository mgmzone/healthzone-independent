
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TestimonialCardProps {
  name: string;
  achievement: string;
  quote: string;
  index: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ name, achievement, quote, index }) => {
  return (
    <motion.div
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
          {name.charAt(0)}
        </div>
        <div>
          <h4 className="font-medium">{name}</h4>
          <p className="text-sm text-muted-foreground">{achievement}</p>
        </div>
      </div>
      <p className="text-muted-foreground italic">"{quote}"</p>
    </motion.div>
  );
};

export default TestimonialCard;
