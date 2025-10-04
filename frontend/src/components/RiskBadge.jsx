import React from 'react';
import { CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';

/**
 * RiskBadge Component
 * 
 * Displays student risk level with appropriate colors, icons, and styling.
 * 
 * @param {String} level - Risk level: 'low', 'medium', or 'high'
 * @param {Number} score - Risk score (0-100)
 */
const RiskBadge = ({ level, score, darkMode }) => {
  /**
   * Get configuration based on risk level
   */
  const getRiskConfig = (riskLevel) => {
    const configs = {
      'low': {
        icon: CheckCircle,
        color: 'text-green-600',
        bg: 'bg-green-50 border-green-200',
        dotColor: 'bg-green-500',
        label: 'Low Risk',
        description: 'Student is performing well'
      },
      'medium': {
        icon: AlertCircle,
        color: 'text-yellow-600',
        bg: 'bg-yellow-50 border-yellow-200',
        dotColor: 'bg-yellow-500',
        label: 'Medium Risk',
        description: 'Monitor student progress'
      },
      'high': {
        icon: AlertTriangle,
        color: 'text-red-600',
        bg: 'bg-red-50 border-red-200',
        dotColor: 'bg-red-500',
        label: 'High Risk',
        description: 'Intervention recommended'
      }
    };
    return configs[riskLevel] || configs['medium'];
  };

  const config = getRiskConfig(level);
  const Icon = config.icon;

  return (
    <div className={`rounded-2xl shadow-lg p-8 border animate-fadeIn ${
        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      }`}>
      <h3 className="text-lg font-bold text-slate-800 mb-4">Risk Assessment</h3>
      
      <div className={`${config.bg} border rounded-xl p-5 flex items-center gap-4 transition-all hover:shadow-md`}>
        {/* Icon */}
        <div className={`${config.color} flex-shrink-0`}>
          <Icon className="w-10 h-10" />
        </div>
        
        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${config.dotColor} animate-pulse`} />
            <p className="font-semibold text-slate-800 text-lg">{config.label}</p>
          </div>
          <p className="text-sm text-slate-600">{config.description}</p>
          <p className="text-xs text-slate-500 mt-2">Risk Score: {score}/100</p>
        </div>
        
        {/* Score Display */}
        <div className="text-right flex-shrink-0">
          <div className={`text-4xl font-bold ${config.color}`}>
            {score}
          </div>
          <p className="text-xs text-slate-500">/ 100</p>
        </div>
      </div>
      
      {/* Risk Score Progress Bar */}
      <div className="mt-4">
        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
          <div 
            className={`${config.dotColor} h-full rounded-full transition-all duration-1000 ease-out`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default RiskBadge;