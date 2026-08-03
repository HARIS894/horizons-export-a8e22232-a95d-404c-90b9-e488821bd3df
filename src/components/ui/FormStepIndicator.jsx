import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const FormStepIndicator = ({ currentStep, totalSteps, steps }) => {
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="w-full mb-8">
      {/* Progress Bar Background */}
      <div className="relative h-2 bg-gray-200 rounded-full mb-4">
        <motion.div
          className="absolute h-full bg-gradient-to-r from-[#6B46C1] to-[#06B6D4] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>

      {/* Steps */}
      <div className="flex justify-between relative">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <div key={index} className="flex flex-col items-center relative z-10">
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                  isActive
                    ? 'border-[#6B46C1] bg-white text-[#6B46C1]'
                    : isCompleted
                    ? 'border-[#6B46C1] bg-[#6B46C1] text-white'
                    : 'border-gray-300 bg-white text-gray-400'
                }`}
                initial={false}
                animate={{
                  scale: isActive ? 1.2 : 1,
                }}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : <span className="text-sm font-semibold">{stepNumber}</span>}
              </motion.div>
              <span className={`text-xs mt-2 font-medium hidden sm:block ${isActive ? 'text-[#6B46C1]' : 'text-gray-500'}`}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FormStepIndicator;