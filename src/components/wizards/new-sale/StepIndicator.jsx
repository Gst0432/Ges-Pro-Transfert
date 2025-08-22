import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const steps = [
  { id: 1, name: 'Informations du client' },
  { id: 2, name: 'Détails des articles' },
  { id: 3, name: 'Finalisation' },
];

export const StepIndicator = ({ currentStep }) => (
  <div className="flex items-center space-x-4">
    {steps.map((step, index) => (
      <React.Fragment key={step.id}>
        <div className="flex flex-col items-center">
          <motion.div
            animate={currentStep >= step.id ? "active" : "inactive"}
            variants={{
              active: { scale: 1, backgroundColor: '#2563EB', color: '#FFFFFF' },
              inactive: { scale: 1, backgroundColor: '#E5E7EB', color: '#6B7280' },
            }}
            transition={{ duration: 0.3 }}
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold"
          >
            {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
          </motion.div>
        </div>
        {index < steps.length - 1 && (
          <div className="flex-1 h-0.5 bg-gray-200 relative">
            <motion.div
              className="absolute top-0 left-0 h-full bg-blue-600"
              initial={{ width: 0 }}
              animate={{ width: currentStep > step.id ? '100%' : '0%' }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </div>
        )}
      </React.Fragment>
    ))}
  </div>
);