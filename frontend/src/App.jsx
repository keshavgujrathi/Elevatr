import React, { useState } from 'react';
import { TrendingUp, Users, Target, Brain, BookOpen } from 'lucide-react';
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
    } catch (err) {
      setError(err.message || 'Failed to connect to API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Elevatr 🎓
              </h1>
              <p className="text-slate-600 text-sm mt-1">AI-powered student success prediction</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-6 mt-6 text-sm">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="text-slate-700 font-medium">82% Accuracy</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              <span className="text-slate-700 font-medium">1000+ Students Analyzed</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-green-600" />
              <span className="text-slate-700 font-medium">Real-time Predictions</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Student Form */}
          <StudentForm 
            onSubmit={handlePredict}
            loading={loading}
            error={error}
            onError={setError}
          />

          {/* Results Section */}
          <div className="space-y-6">
            {prediction ? (
              <>
                <ResultCard 
                  grade={prediction.predicted_grade}
                  confidence={prediction.confidence}
                />
                
                <RiskBadge 
                  level={prediction.risk_level}
                  score={prediction.risk_score}
                />
                
                <RecommendationList 
                  recommendations={prediction.recommendations}
                />
                
                <FeatureChart 
                  impacts={prediction.feature_impacts}
                />
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-12 border border-slate-200 text-center">
                <div className="bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Ready to Predict</h3>
                <p className="text-slate-600">
                  Fill in the student profile and click "Predict Grade" to see AI-powered insights.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-slate-600 text-sm">
          <p>Elevatr © 2025 • Built with React + Flask • Powered by Machine Learning</p>
        </div>
      </footer>
    </div>
  );
}

export default App;