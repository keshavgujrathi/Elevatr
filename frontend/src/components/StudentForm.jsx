import React, { useState } from 'react';
import { Sparkles, Brain, Loader2 } from 'lucide-react';

const SAMPLE_STUDENTS = [
  {
    name: "High Performer",
    data: {
      age: 21,
      gender: "F",
      study_hours_weekly: 32,
      attendance_percent: 95,
      previous_gpa: 9.2,
      assignments_completed: 98,
      participation_score: 90,
      midterm_score: 92,
      hours_on_platform: 150
    }
  },
  {
    name: "Average Student",
    data: {
      age: 20,
      gender: "M",
      study_hours_weekly: 18,
      attendance_percent: 78,
      previous_gpa: 7.2,
      assignments_completed: 75,
      participation_score: 65,
      midterm_score: 68,
      hours_on_platform: 85
    }
  },
  {
    name: "At-Risk Student",
    data: {
      age: 19,
      gender: "F",
      study_hours_weekly: 8,
      attendance_percent: 55,
      previous_gpa: 5.8,
      assignments_completed: 45,
      participation_score: 35,
      midterm_score: 42,
      hours_on_platform: 25
    }
  }
];

/**
 * StudentForm Component
 * 
 * A comprehensive form for collecting student performance data.
 * Includes validation, sample data loading, and responsive design.
 * 
 * @param {Function} onSubmit - Callback function when form is submitted with valid data
 * @param {Boolean} loading - Loading state to disable form during API calls
 * @param {String} error - Error message to display
 * @param {Function} onError - Callback to clear/set errors
 */
const StudentForm = ({ onSubmit, loading, error, onError, darkMode }) => {
  const [formData, setFormData] = useState({
    age: 20,
    gender: 'M',
    study_hours_weekly: 20,
    attendance_percent: 80,
    previous_gpa: 7.5,
    assignments_completed: 80,
    participation_score: 70,
    midterm_score: 75,
    hours_on_platform: 100
  });

  /**
   * Handle input changes and clear errors
   */
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (onError) onError(null);
  };

  /**
   * Load sample student data into form
   */
  const loadSampleStudent = (sample) => {
    setFormData(sample.data);
    if (onError) onError(null);
  };

  /**
   * Validate form data before submission
   */
  const validateForm = () => {
    if (formData.age < 18 || formData.age > 25) {
      return "Age must be between 18-25";
    }
    if (formData.study_hours_weekly < 5 || formData.study_hours_weekly > 40) {
      return "Study hours must be between 5-40";
    }
    if (formData.previous_gpa < 5.0 || formData.previous_gpa > 10.0) {
      return "Previous GPA must be between 5.0-10.0";
    }
    if (formData.hours_on_platform < 10 || formData.hours_on_platform > 200) {
      return "Platform hours must be between 10-200";
    }
    return null;
  };

  /**
   * Handle form submission with validation
   */
  const handleSubmit = () => {
    const validationError = validateForm();
    if (validationError) {
      if (onError) onError(validationError);
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className={`rounded-2xl shadow-lg p-8 border animate-fadeIn ${
        darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      }`}>
      {/* Header with Sample Button */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Student Profile</h2>
        <div className="relative group">
          <button
            onClick={() => loadSampleStudent(SAMPLE_STUDENTS[0])}
            disabled={loading}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            Try Sample
          </button>
          {/* Dropdown menu for sample students */}
          <div className="absolute right-0 mt-2 hidden group-hover:block bg-white shadow-lg rounded-lg p-2 w-48 z-10 border border-slate-200">
            {SAMPLE_STUDENTS.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => loadSampleStudent(sample)}
                disabled={loading}
                className="block w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded transition-colors disabled:opacity-50"
              >
                {sample.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Age
            </label>
            <input
              type="number"
              min="18"
              max="25"
              value={formData.age}
              onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
              disabled={loading}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Gender
            </label>
            <select
              value={formData.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
            >
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </div>
        </div>

        {/* Study Hours Slider */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Study Hours per Week: <span className="text-blue-600 font-semibold">{formData.study_hours_weekly}h</span>
          </label>
          <input
            type="range"
            min="5"
            max="40"
            value={formData.study_hours_weekly}
            onChange={(e) => handleInputChange('study_hours_weekly', parseFloat(e.target.value))}
            disabled={loading}
            className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer slider disabled:opacity-50"
          />
        </div>

        {/* Attendance Slider */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Attendance: <span className="text-blue-600 font-semibold">{formData.attendance_percent}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={formData.attendance_percent}
            onChange={(e) => handleInputChange('attendance_percent', parseFloat(e.target.value))}
            disabled={loading}
            className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer slider disabled:opacity-50"
          />
        </div>

        {/* Previous GPA */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Previous GPA (5.0-10.0)
          </label>
          <input
            type="number"
            step="0.1"
            min="5.0"
            max="10.0"
            value={formData.previous_gpa}
            onChange={(e) => handleInputChange('previous_gpa', parseFloat(e.target.value))}
            disabled={loading}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
          />
        </div>

        {/* Assignment Completion Slider */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Assignment Completion: <span className="text-blue-600 font-semibold">{formData.assignments_completed}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={formData.assignments_completed}
            onChange={(e) => handleInputChange('assignments_completed', parseInt(e.target.value))}
            disabled={loading}
            className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer slider disabled:opacity-50"
          />
        </div>

        {/* Participation Score Slider */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Participation Score: <span className="text-blue-600 font-semibold">{formData.participation_score}</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={formData.participation_score}
            onChange={(e) => handleInputChange('participation_score', parseInt(e.target.value))}
            disabled={loading}
            className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer slider disabled:opacity-50"
          />
        </div>

        {/* Midterm Score Slider */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Midterm Score: <span className="text-blue-600 font-semibold">{formData.midterm_score}</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={formData.midterm_score}
            onChange={(e) => handleInputChange('midterm_score', parseInt(e.target.value))}
            disabled={loading}
            className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer slider disabled:opacity-50"
          />
        </div>

        {/* Platform Hours */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Platform Hours
          </label>
          <input
            type="number"
            min="10"
            max="200"
            value={formData.hours_on_platform}
            onChange={(e) => handleInputChange('hours_on_platform', parseInt(e.target.value))}
            disabled={loading}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 animate-fadeIn">
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Predicting...
            </>
          ) : (
            <>
              <Brain className="w-5 h-5" />
              Predict Grade
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default StudentForm;