import React from 'react';

/**
 * ResultCard Component
 * 
 * Displays the predicted grade with confidence score in a visually appealing card.
 * Color-coded by grade with smooth animations.
 * 
 * @param {String} grade - Predicted grade (S/A/B/C/D/F)
 * @param {Number} confidence - Confidence score (0-1)
 */
const ResultCard = ({ grade, confidence }) => {
  /**
   * Get gradient colors based on grade
   */
  const getGradeColor = (grade) => {
    const colors = {
      'S': 'from-purple-500 to-pink-500',
      'A': 'from-green-500 to-emerald-500',
      'B': 'from-blue-500 to-cyan-500',
      'C': 'from-yellow-500 to-orange-500',
      'D': 'from-orange-500 to-red-500',
      'F': 'from-red-500 to-rose-500'
    };
    return colors[grade] || 'from-gray-500 to-gray-600';
  };

  /**
   * Get descriptive text based on grade
   */
  const getGradeDescription = (grade) => {
    const descriptions = {
      'S': 'Outstanding Performance',
      'A': 'Excellent Work',
      'B': 'Good Performance',
      'C': 'Satisfactory',
      'D': 'Needs Improvement',
      'F': 'Requires Intervention'
    };
    return descriptions[grade] || 'Grade Predicted';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200 animate-fadeIn">
      <div className="text-center">
        <p className="text-sm font-medium text-slate-600 mb-4">Predicted Grade</p>
        
        {/* Large Grade Badge */}
        <div className={`inline-flex items-center justify-center w-32 h-32 rounded-3xl bg-gradient-to-br ${getGradeColor(grade)} text-white text-6xl font-bold shadow-xl mb-4 transform transition-transform hover:scale-105`}>
          {grade}
        </div>
        
        {/* Grade Description */}
        <p className="text-lg font-semibold text-slate-800 mb-6">
          {getGradeDescription(grade)}
        </p>
        
        {/* Confidence Score */}
        <div className="mt-6">
          <p className="text-sm text-slate-600 mb-2">Confidence Score</p>
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden shadow-inner">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${confidence * 100}%` }}
            />
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">
            {(confidence * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Model prediction accuracy
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;