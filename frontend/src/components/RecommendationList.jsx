import React from 'react';
import { Award, TrendingUp, BookOpen, Users, Target, Sparkles } from 'lucide-react';

/**
 * RecommendationList Component
 * 
 * Displays personalized recommendations with icons and animations.
 * Each recommendation fades in with a stagger effect.
 * 
 * @param {Array} recommendations - Array of recommendation strings
 */
const RecommendationList = ({ recommendations }) => {
  /**
   * Get icon based on recommendation content keywords
   */
  const getRecommendationIcon = (text) => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('attendance') || lowerText.includes('attendance')) {
      return Users;
    } else if (lowerText.includes('study') || lowerText.includes('hours')) {
      return BookOpen;
    } else if (lowerText.includes('assignment') || lowerText.includes('complete')) {
      return Target;
    } else if (lowerText.includes('participation') || lowerText.includes('engage')) {
      return TrendingUp;
    } else if (lowerText.includes('excellent') || lowerText.includes('great') || lowerText.includes('outstanding')) {
      return Sparkles;
    } else {
      return Award;
    }
  };

  /**
   * Get color based on sentiment
   */
  const getRecommendationColor = (text) => {
    const lowerText = text.toLowerCase();
    
    // Positive sentiment
    if (lowerText.includes('excellent') || lowerText.includes('great') || lowerText.includes('outstanding') || lowerText.includes('✓')) {
      return 'bg-green-50 border-green-200 text-green-800';
    }
    // Warning/improvement
    else if (lowerText.includes('increase') || lowerText.includes('improve') || lowerText.includes('focus') || lowerText.includes('⚠️')) {
      return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
    // Urgent/critical
    else if (lowerText.includes('urgent') || lowerText.includes('critical') || lowerText.includes('🚨')) {
      return 'bg-red-50 border-red-200 text-red-800';
    }
    // Default neutral
    else {
      return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-blue-600" />
          Recommendations
        </h3>
        <p className="text-slate-600 text-center py-8">
          No recommendations available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 animate-fadeIn">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Award className="w-5 h-5 text-blue-600" />
        Personalized Recommendations
      </h3>
      
      <ul className="space-y-3">
        {recommendations.map((rec, idx) => {
          const Icon = getRecommendationIcon(rec);
          const colorClass = getRecommendationColor(rec);
          
          return (
            <li 
              key={idx} 
              className={`flex items-start gap-3 p-4 rounded-lg border ${colorClass} transition-all hover:shadow-md animate-fadeIn`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">
                <Icon className="w-5 h-5" />
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-lg flex-shrink-0">{idx + 1}.</span>
                  <span className="text-sm leading-relaxed">{rec}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      
      {/* Summary footer */}
      <div className="mt-4 pt-4 border-t border-slate-200">
        <p className="text-xs text-slate-500 text-center">
          {recommendations.length} personalized recommendation{recommendations.length !== 1 ? 's' : ''} generated
        </p>
      </div>
    </div>
  );
};

export default RecommendationList;