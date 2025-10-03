import React from 'react';
import { BarChart3 } from 'lucide-react';

/**
 * FeatureChart Component
 * 
 * Displays feature impact analysis as horizontal bars.
 * Color-coded based on impact level (positive/negative).
 * 
 * @param {Object} impacts - Object mapping feature names to impact levels
 */
const FeatureChart = ({ impacts }) => {
  /**
   * Get color based on impact level
   */
  const getImpactColor = (impact) => {
    const colors = {
      'strong_positive': { bg: 'bg-green-500', text: 'text-green-700' },
      'positive': { bg: 'bg-green-400', text: 'text-green-600' },
      'neutral': { bg: 'bg-gray-400', text: 'text-gray-600' },
      'negative': { bg: 'bg-orange-400', text: 'text-orange-600' },
      'strong_negative': { bg: 'bg-red-500', text: 'text-red-700' }
    };
    return colors[impact] || colors['neutral'];
  };

  /**
   * Get bar width based on impact level
   */
  const getImpactWidth = (impact) => {
    const widths = {
      'strong_positive': 100,
      'positive': 70,
      'neutral': 40,
      'negative': 70,
      'strong_negative': 100
    };
    return widths[impact] || 40;
  };

  /**
   * Format feature name for display
   */
  const formatFeatureName = (name) => {
    return name
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  /**
   * Format impact label
   */
  const formatImpactLabel = (impact) => {
    return impact.replace(/_/g, ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (!impacts || Object.keys(impacts).length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-600" />
          Feature Impact Analysis
        </h3>
        <p className="text-slate-600 text-center py-8">
          No feature impact data available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 animate-fadeIn">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-purple-600" />
        Feature Impact Analysis
      </h3>
      
      <p className="text-sm text-slate-600 mb-6">
        How each factor influences the predicted grade
      </p>
      
      <div className="space-y-4">
        {Object.entries(impacts).map(([feature, impact], idx) => {
          const colors = getImpactColor(impact);
          const width = getImpactWidth(impact);
          
          return (
            <div 
              key={feature} 
              className="animate-fadeIn"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              {/* Feature name and impact label */}
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-slate-700 font-medium">
                  {formatFeatureName(feature)}
                </span>
                <span className={`text-xs font-semibold ${colors.text} px-2 py-1 rounded-full bg-opacity-10`}>
                  {formatImpactLabel(impact)}
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
                <div 
                  className={`${colors.bg} h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2`}
                  style={{ width: `${width}%` }}
                >
                  {width >= 50 && (
                    <span className="text-white text-xs font-bold">
                      {width}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-slate-200">
        <div className="flex flex-wrap gap-3 justify-center text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-slate-600">Positive Impact</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-gray-400" />
            <span className="text-slate-600">Neutral</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-slate-600">Negative Impact</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureChart;