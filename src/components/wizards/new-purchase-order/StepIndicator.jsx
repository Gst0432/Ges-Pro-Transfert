import React from 'react';
import { motion } from 'framer-motion';

export const StepIndicator = ({ currentStep, steps }) => {
  return (
    <div className="flex items-center justify-center space-x-4">
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center">
            <motion.div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-colors duration-300`}
              animate={{
                backgroundColor: currentStep >= index ? '#2563EB' : '#FFFFFF',
                borderColor: currentStep >= index ? '#2563EB' : '#E5E7EB',
                color: currentStep >= index ? '#FFFFFF' : '#6B7280',
              }}
            >
              {index + 1}
            </motion.div>
            <p className={`mt-2 text-sm font-medium transition-colors duration-300 ${currentStep >= index ? 'text-blue-600' : 'text-gray-500'}`}>
              {step}
            </p>
          </div>
          {index < steps.length - 1 && (
            <div className="flex-1 h-1 bg-gray-200 rounded-full relative">
              <motion.div
                className="absolute top-0 left-0 h-full bg-blue-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: currentStep > index ? '100%' : '0%' }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};