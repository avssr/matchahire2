'use client'

import React from 'react'

interface ProgressBarProps {
  current: number;
  total: number;
  showText?: boolean;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  current, 
  total, 
  showText = true,
  className = ''
}) => {
  // Calculate percentage
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  
  return (
    <div className={`w-full ${className}`}>
      {showText && (
        <div className="flex justify-between mb-1 text-xs text-gray-500">
          <span>Progress</span>
          <span>{current} of {total}</span>
        </div>
      )}
      
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-green-600 to-teal-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar; 