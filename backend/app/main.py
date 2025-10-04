from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import numpy as np
import os
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Configuration from environment variables
app.config['DEBUG'] = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
app.config['ENV'] = os.getenv('FLASK_ENV', 'production')

# CORS configuration - allow all origins in production (adjust as needed)
ALLOWED_ORIGINS = os.getenv('ALLOWED_ORIGINS', '*')
CORS(app, origins=ALLOWED_ORIGINS)

# Global variables for model artifacts
model = None
scaler = None
label_encoder = None
feature_names = None

# Load model on startup
def load_model_artifacts():
    """Load all ML model artifacts from the models directory."""
    global model, scaler, label_encoder, feature_names
    try:
        models_dir = 'models'
        
        logger.info(f"Loading models from: {models_dir}")
        
        model_path = os.path.join(models_dir, 'elevatr_model.pkl')
        scaler_path = os.path.join(models_dir, 'scaler.pkl')
        encoder_path = os.path.join(models_dir, 'label_encoder.pkl')
        
        model = joblib.load(model_path)
        scaler = joblib.load(scaler_path)
        label_encoder = joblib.load(encoder_path)
        
        feature_names = ['age', 'study_hours_weekly', 'attendance_percent', 
                        'previous_gpa', 'assignments_completed', 'participation_score',
                        'midterm_score', 'hours_on_platform', 'gender_encoded']
        
        logger.info("✓ Model artifacts loaded successfully")
        return True
    except FileNotFoundError as e:
        logger.error(f"✗ Model file not found: {e}")
        return False
    except Exception as e:
        logger.error(f"✗ Failed to load model: {e}")
        return False

# Validate input data
def validate_student_data(data):
    """Validate student input data for required fields and value ranges."""
    required_fields = ['age', 'gender', 'study_hours_weekly', 'attendance_percent',
                      'previous_gpa', 'assignments_completed', 'participation_score',
                      'midterm_score', 'hours_on_platform']
    
    # Check required fields
    for field in required_fields:
        if field not in data:
            return False, f"Missing required field: {field}"
    
    # Validate ranges
    validations = {
        'age': (18, 25, "Age must be between 18-25"),
        'study_hours_weekly': (5, 40, "Study hours must be between 5-40"),
        'attendance_percent': (0, 100, "Attendance must be between 0-100"),
        'previous_gpa': (5.0, 10.0, "Previous GPA must be between 5.0-10.0"),
        'assignments_completed': (0, 100, "Assignments completed must be between 0-100"),
        'participation_score': (0, 100, "Participation score must be between 0-100"),
        'midterm_score': (0, 100, "Midterm score must be between 0-100"),
        'hours_on_platform': (10, 200, "Hours on platform must be between 10-200")
    }
    
    for field, (min_val, max_val, msg) in validations.items():
        try:
            value = float(data[field])
            if not (min_val <= value <= max_val):
                return False, msg
        except (ValueError, TypeError):
            return False, f"{field} must be a valid number"
    
    if data['gender'] not in ['M', 'F']:
        return False, "Gender must be 'M' or 'F'"
    
    return True, None

# Generate recommendations
def generate_recommendations(data, predicted_grade):
    """Generate personalized recommendations based on student data and prediction."""
    recommendations = []
    
    attendance = data['attendance_percent']
    study_hours = data['study_hours_weekly']
    assignments = data['assignments_completed']
    participation = data['participation_score']
    midterm = data['midterm_score']
    
    # Critical issues first (D/F grades)
    if predicted_grade in ['D', 'F']:
        if attendance < 70:
            recommendations.append(f"🚨 URGENT: Attendance is {attendance:.0f}%. Aim for 80%+ immediately")
        if assignments < 60:
            recommendations.append(f"📝 CRITICAL: Complete missing assignments (currently {assignments}%)")
        if study_hours < 15:
            recommendations.append(f"⏰ Increase study time from {study_hours:.0f} to 20+ hours/week")
        recommendations.append("💬 Schedule meeting with academic advisor for support plan")
    
    # Moderate concerns (C grade)
    elif predicted_grade == 'C':
        if attendance < 80:
            recommendations.append(f"📊 Boost attendance from {attendance:.0f}% to 85%+ for better grades")
        if study_hours < 20:
            recommendations.append(f"📚 Add {20 - study_hours:.0f} more study hours weekly")
        if assignments < 80:
            recommendations.append(f"✅ Focus on assignment quality - currently at {assignments}%")
    
    # Optimization (B grade)
    elif predicted_grade == 'B':
        if study_hours < 25:
            recommendations.append(f"⭐ Add 3-5 study hours weekly to reach grade A")
        if assignments < 90:
            recommendations.append("📈 Push assignment completion to 90%+ for top performance")
        recommendations.append("✓ Good foundation - small improvements yield big results!")
    
    # Excellence maintenance (A/S grades)
    else:
        if attendance >= 90:
            recommendations.append("🌟 Excellent attendance - keep up the consistency!")
        if study_hours >= 25:
            recommendations.append("💪 Strong study habits - you're setting a great example")
        if assignments >= 90:
            recommendations.append("✓ Outstanding assignment completion rate")
    
    return recommendations[:5]

# Calculate feature impacts
def calculate_feature_impacts(data):
    """Analyze which features positively or negatively impact performance."""
    impacts = {}
    
    # Attendance impact
    attendance = data['attendance_percent']
    if attendance >= 90:
        impacts['attendance_percent'] = 'strong_positive'
    elif attendance >= 80:
        impacts['attendance_percent'] = 'positive'
    elif attendance >= 70:
        impacts['attendance_percent'] = 'neutral'
    else:
        impacts['attendance_percent'] = 'negative'
    
    # Study hours impact
    study_hours = data['study_hours_weekly']
    if study_hours >= 30:
        impacts['study_hours_weekly'] = 'strong_positive'
    elif study_hours >= 20:
        impacts['study_hours_weekly'] = 'positive'
    elif study_hours >= 15:
        impacts['study_hours_weekly'] = 'neutral'
    else:
        impacts['study_hours_weekly'] = 'negative'
    
    # Midterm score impact
    midterm = data['midterm_score']
    if midterm >= 85:
        impacts['midterm_score'] = 'strong_positive'
    elif midterm >= 70:
        impacts['midterm_score'] = 'positive'
    elif midterm >= 60:
        impacts['midterm_score'] = 'neutral'
    else:
        impacts['midterm_score'] = 'negative'
    
    return impacts

# Calculate risk score
def calculate_risk_score(data):
    """Calculate student risk score (0-100)."""
    risk_score = 0
    
    # Attendance impact
    if data['attendance_percent'] < 50:
        risk_score += 30
    elif data['attendance_percent'] < 70:
        risk_score += 20
    elif data['attendance_percent'] < 80:
        risk_score += 10
    
    # Study hours impact
    if data['study_hours_weekly'] < 10:
        risk_score += 25
    elif data['study_hours_weekly'] < 15:
        risk_score += 15
    
    # Assignment completion impact
    if data['assignments_completed'] < 50:
        risk_score += 25
    elif data['assignments_completed'] < 70:
        risk_score += 18
    
    # Midterm performance impact
    if data['midterm_score'] < 40:
        risk_score += 15
    elif data['midterm_score'] < 60:
        risk_score += 10
    
    return min(risk_score, 100)

# Make prediction
def predict_student(data):
    """Make prediction for a single student."""
    # Encode gender
    gender_encoded = 0 if data['gender'] == 'F' else 1
    
    # Prepare features
    features = [
        data['age'],
        data['study_hours_weekly'],
        data['attendance_percent'],
        data['previous_gpa'],
        data['assignments_completed'],
        data['participation_score'],
        data['midterm_score'],
        data['hours_on_platform'],
        gender_encoded
    ]
    
    # Scale features
    features_scaled = scaler.transform([features])
    
    # Predict
    prediction = model.predict(features_scaled)[0]
    predicted_grade = label_encoder.inverse_transform([prediction])[0]
    
    # Get confidence
    if hasattr(model, 'predict_proba'):
        proba = model.predict_proba(features_scaled)[0]
        confidence = float(proba[prediction])
    else:
        confidence = 0.85
    
    # Calculate risk
    risk_score = calculate_risk_score(data)
    if predicted_grade in ['D', 'F']:
        risk_level = 'high'
    elif predicted_grade == 'C':
        risk_level = 'medium'
    else:
        risk_level = 'low'
    
    return {
        'predicted_grade': predicted_grade,
        'confidence': round(confidence, 2),
        'risk_level': risk_level,
        'risk_score': int(risk_score),
        'recommendations': generate_recommendations(data, predicted_grade),
        'feature_impacts': calculate_feature_impacts(data)
    }

# API Endpoints
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint for monitoring."""
    status = {
        'status': 'healthy' if model is not None else 'unhealthy',
        'model_loaded': model is not None,
        'environment': app.config['ENV']
    }
    logger.info(f"Health check: {status}")
    return jsonify(status)

@app.route('/api/predict', methods=['POST'])
def predict():
    """Predict student grade endpoint."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate input
        is_valid, error_msg = validate_student_data(data)
        if not is_valid:
            logger.warning(f"Validation failed: {error_msg}")
            return jsonify({'error': error_msg}), 400
        
        # Make prediction
        result = predict_student(data)
        
        logger.info(f"Prediction: {result['predicted_grade']} (confidence: {result['confidence']})")
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}", exc_info=True)
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500

@app.route('/api/batch', methods=['POST'])
def batch_predict():
    """Batch prediction endpoint."""
    try:
        data = request.get_json()
        
        if not isinstance(data, list):
            return jsonify({'error': 'Expected array of student data'}), 400
        
        if len(data) > 100:
            return jsonify({'error': 'Batch size limited to 100 students'}), 400
        
        results = []
        for idx, student_data in enumerate(data):
            is_valid, error_msg = validate_student_data(student_data)
            if not is_valid:
                results.append({'error': f"Student {idx}: {error_msg}"})
            else:
                results.append(predict_student(student_data))
        
        logger.info(f"Batch prediction: {len(results)} students processed")
        return jsonify(results)
        
    except Exception as e:
        logger.error(f"Batch prediction error: {str(e)}", exc_info=True)
        return jsonify({'error': f'Batch prediction failed: {str(e)}'}), 500

@app.route('/', methods=['GET'])
def index():
    """Root endpoint with API information."""
    return jsonify({
        'name': 'Elevatr API',
        'version': '1.0.0',
        'description': 'AI-powered student performance prediction API',
        'endpoints': {
            'health': '/api/health',
            'predict': '/api/predict',
            'batch': '/api/batch'
        }
    })

# Initialize app
if __name__ == '__main__':
    if load_model_artifacts():
        port = int(os.getenv('PORT', 5000))
        debug_mode = app.config['DEBUG']
        
        logger.info(f"Starting Elevatr API on port {port} (debug={debug_mode})")
        app.run(debug=debug_mode, host='0.0.0.0', port=port)
    else:
        logger.error("Failed to start: Could not load model artifacts")
        exit(1)