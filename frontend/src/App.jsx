import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, 
  Users, 
  Target, 
  Brain, 
  BookOpen,
  Share2,
  RotateCcw,
  Moon,
  Sun,
  Github,
  Sparkles,
  Zap,
  Shield,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import StudentForm from './components/StudentForm';
import ResultCard from './components/ResultCard';
import RiskBadge from './components/RiskBadge';
import RecommendationList from './components/RecommendationList';
import FeatureChart from './components/FeatureChart';
import './App.css';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [stats, setStats] = useState({
    studentsToday: 0,
    avgAccuracy: 0,
    commonGrade: 'B'
  });
  const resultsRef = useRef(null);

  // Animate stats on mount
  useEffect(() => {
    animateValue('studentsToday', 0, 127, 2000);
    animateValue('avgAccuracy', 0, 83, 2000);
  }, []);

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  /**
   * Animate number counting up
   */
  const animateValue = (key, start, end, duration) => {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        current = end;
        clearInterval(timer);
      }
      setStats(prev => ({ ...prev, [key]: Math.floor(current) }));
    }, 16);
  };

  /**
   * Handle prediction with confetti for high grades
   */
  const handlePredict = async (formData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Prediction failed');
      }

      const result = await response.json();
      setPrediction(result);
      
      // Smooth scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
      
      // Trigger confetti for A/S grades
      if (result.predicted_grade === 'S' || result.predicted_grade === 'A') {
        setTimeout(() => {
          try {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });
          } catch (e) {
            console.error("Confetti error:", e);
          }
        }, 500);
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to API');
      // Shake animation for error
      document.querySelector('.student-form')?.classList.add('shake');
      setTimeout(() => {
        document.querySelector('.student-form')?.classList.remove('shake');
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset form and prediction
   */
  const handleReset = () => {
    setPrediction(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Share result
   */
  const handleShare = async () => {
    if (!prediction) return;
    
    const shareText = `I got grade ${prediction.predicted_grade} with ${(prediction.confidence * 100).toFixed(0)}% confidence on Elevatr! 🎓`;
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Elevatr Prediction',
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-slate-900' : 'bg-gradient-to-br from-slate-50 to-blue-50'}`}>
      {/* Hero Section */}
      <header className={`border-b shadow-sm transition-colors ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Elevatr 🎓
                </h1>
                <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  AI-powered student success prediction
                </p>
              </div>
            </div>
            
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-3 rounded-lg transition-all ${darkMode ? 'bg-slate-700 text-yellow-400' : 'bg-slate-100 text-slate-700'} hover:scale-110`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
          
          {/* Stats Bar */}
          <div className="flex flex-wrap gap-6 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600" />
              <span className={`font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {stats.avgAccuracy}% Accuracy
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              <span className={`font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {stats.studentsToday}+ Students Today
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-green-600" />
              <span className={`font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Real-time Predictions
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* How It Works Section */}
        {!prediction && (
          <div className={`mb-12 rounded-2xl shadow-lg p-8 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <h2 className={`text-2xl font-bold text-center mb-8 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className={`font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  1. Enter Data
                </h3>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Fill in student performance metrics and academic history
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className={`font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  2. AI Analysis
                </h3>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Machine learning model analyzes patterns from 1000+ students
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className={`font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  3. Get Insights
                </h3>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Receive grade prediction, risk assessment, and recommendations
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Student Form */}
          <div className="student-form">
            <StudentForm 
              onSubmit={handlePredict}
              loading={loading}
              error={error}
              onError={setError}
              darkMode={darkMode}
            />
          </div>

          {/* Results Section */}
          <div className="space-y-6" ref={resultsRef}>
            {loading ? (
              // Loading Skeleton
              <div className="space-y-6 animate-pulse">
                <div className={`rounded-2xl h-64 ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                <div className={`rounded-2xl h-32 ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                <div className={`rounded-2xl h-48 ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
              </div>
            ) : prediction ? (
              <>
                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleShare}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${darkMode ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                  >
                    <Share2 className="w-4 h-4" />
                    Share Result
                  </button>
                  <button
                    onClick={handleReset}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${darkMode ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </button>
                </div>

                <ResultCard 
                  grade={prediction.predicted_grade}
                  confidence={prediction.confidence}
                  darkMode={darkMode}
                />
                
                <RiskBadge 
                  level={prediction.risk_level}
                  score={prediction.risk_score}
                  darkMode={darkMode}
                />
                
                <RecommendationList 
                  recommendations={prediction.recommendations}
                  darkMode={darkMode}
                />
                
                <FeatureChart 
                  impacts={prediction.feature_impacts}
                  darkMode={darkMode}
                />
              </>
            ) : (
              // Landing State
              <div className={`rounded-2xl shadow-lg p-12 border text-center ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                  <Sparkles className={`w-12 h-12 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`} />
                </div>
                <h3 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  Ready to Predict Success
                </h3>
                <p className={`mb-6 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Fill in the student profile to get AI-powered grade predictions,
                  risk assessments, and personalized recommendations.
                </p>
                
                {/* Social Proof */}
                <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      1000+
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Students
                    </div>
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                      83%
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Accuracy
                    </div>
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                      5+
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Features
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Analytics Section */}
        <div className={`mt-12 rounded-2xl shadow-lg p-8 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          <h2 className={`text-2xl font-bold text-center mb-8 ${darkMode ? 'text-white' : 'text-slate-800'}`}>
            Platform Statistics
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {stats.studentsToday}
              </div>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Students Analyzed Today
              </p>
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                {stats.avgAccuracy}%
              </div>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Average Model Accuracy
              </p>
            </div>
            <div>
              <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                {stats.commonGrade}
              </div>
              <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Most Common Grade
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`border-t mt-16 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              <p className="font-semibold mb-1">Elevatr © 2025</p>
              <p>Built with React + Flask • Powered by Machine Learning</p>
            </div>
            
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/keshavgujrathi/Elevatr"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${darkMode ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                <Github className="w-5 h-5" />
                <span className="text-sm font-medium">View on GitHub</span>
              </a>
            </div>
          </div>
          
          <div className={`mt-6 pt-6 border-t text-center text-sm ${darkMode ? 'border-slate-700 text-slate-500' : 'border-slate-200 text-slate-500'}`}>
            <p>
              Designed & Developed by{' '}
              <a 
                href="https://github.com/keshavgujrathi" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-semibold text-blue-600 hover:underline"
              >
                Keshav Gujrathi
              </a> • 
              <a href="mailto:gujrathikeshav9@gmail.com" className="ml-2 hover:text-blue-600 transition-colors">
                Contact
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;