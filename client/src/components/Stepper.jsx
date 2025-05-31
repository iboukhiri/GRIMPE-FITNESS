import React from 'react';

const Stepper = ({ steps = [], currentStep = 0, onStepClick = () => {} }) => {
  return (
    <div className="flex space-x-4 overflow-x-auto md:hidden py-4 bg-white dark:bg-gray-800">
      {steps.map((label, idx) => (
        <div key={label} className="flex-shrink-0 text-center">
          <button
            onClick={() => onStepClick(idx)}
            className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-150 ${
              idx === currentStep ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
            }`}
            aria-current={idx === currentStep}
          >
            {idx + 1}
          </button>
          <p className={`mt-1 text-xs whitespace-nowrap transition-colors duration-150 ${
            idx === currentStep ? 'text-primary-500' : 'text-gray-600 dark:text-gray-400'
          }`}>
            {label}
          </p>
        </div>
      ))}
    </div>
  );
};

export default Stepper; 