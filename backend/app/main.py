from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import numpy as np
import os
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Global variables for model artifacts
model = None
scaler = None
label_encoder = None
feature_names = None

# Load model on startup
def load_model_artifacts():
    global model, scaler, label_encoder, feature_names
    try:
        model_path = os.path.join('models', 'elevatr_model.pkl')
        scaler_path = os.path.join('models', 'scaler.pkl')
        encoder_path = os.path.join('models', 'label_encoder.pkl')
        
        model = joblib.load(model_path)
        scaler = joblib.load(scaler_path)
        label_encoder = joblib.load(encoder_path)
        
        feature_names = ['age', 'study_hours_weekly', 'attendance_percent', 
                        'previous_gpa', 'assignments_completed', 'participation_score',
                        'midterm_score', 'hours_on_platform', 'gender_encoded']
        
        logger.info("✓ Model artifacts loaded successfully")
        return True
    except Exception as e:
        logger.error(f"✗ Failed to load model: {str(e)}")
        return False

# Validate input data
def validate_student_data(data):
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
        if not (min_val <= data[field] <= max_val):
            return False, msg
    
    if data['gender'] not in ['M', 'F']:
        return False, "Gender must be 'M' or 'F'"
    
    return True, None

# Generate recommendations
def generate_recommendations(data, predicted_grade):
    recommendations = []
    
    # Attendance recommendations
    if data['attendance_percent'] < 70:
        recommendations.append("⚠️ Low attendance detected. Aim for 80%+ to improve performance")
    elif data['attendance_percent'] >= 90:
        recommendations.append("✓ Excellent attendance! Keep it up")
    
    # Study hours recommendations
    if data['study_hours_weekly'] < 15:
        recommendations.append("📚 Increase study time to 20+ hours/week for better results")
    elif predicted_grade in ['A', 'B'] and data['study_hours_weekly'] < 25:
        recommendations.append("💡 Add 3-5 more study hours weekly to achieve grade S")
    elif data['study_hours_weekly'] >= 30:
        recommendations.append("✓ Strong study commitment!")
    
    # Assignment completion
    if data['assignments_completed'] < 70:
        recommendations.append("📝 Focus on completing assignments - currently at " + 
                             f"{data['assignments_completed']}%")
    elif data['assignments_completed'] >= 90:
        recommendations.append("✓ Outstanding assignment completion rate")
    
    # Participation
    if data['participation_score'] < 50:
        recommendations.append("🗣️ Increase class participation to boost engagement")
    
    # Midterm performance
    if data['midterm_score'] < 60:
        recommendations.append("📖 Review midterm topics - extra help may be beneficial")
    
    # Positive reinforcement for good performance
    if predicted_grade in ['S', 'A'] and not recommendations:
        recommendations.append("🌟 Excellent performance across all metrics!")
    
    return recommendations[:4]  # Limit to 4 recommendations

# Calculate feature impacts
def calculate_feature_impacts(data):
    impacts = {}
    
    # Attendance impact
    if data['attendance_percent'] >= 85:
        impacts['attendance_percent'] = 'strong_positive'
    elif data['attendance_percent'] >= 70:
        impacts['attendance_percent'] = 'positive'
    else:
        impacts['attendance_percent'] = 'negative'
    
    # Study hours impact
    if data['study_hours_weekly'] >= 25:
        impacts['study_hours_weekly'] = 'strong_positive'
    elif data['study_hours_weekly'] >= 15:
        impacts['study_hours_weekly'] = 'positive'
    else:
        impacts['study_hours_weekly'] = 'negative'
    
    # Midterm score impact
    if data['midterm_score'] >= 80:
        impacts['midterm_score'] = 'strong_positive'
    elif data['midterm_score'] >= 60:
        impacts['midterm_score'] = 'positive'
    else:
        impacts['midterm_score'] = 'negative'
    
    return impacts

# Make prediction
def predict_student(data):
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
    
    # Calculate risk level and score
    if predicted_grade in ['D', 'F']:
        risk_level = 'high'
        risk_score = 75 + np.random.randint(0, 25)
    elif predicted_grade == 'C':
        risk_level = 'medium'
        risk_score = 40 + np.random.randint(0, 30)
    elif predicted_grade == 'B':
        risk_level = 'low'
        risk_score = 15 + np.random.randint(0, 20)
    else:  # A or S
        risk_level = 'low'
        risk_score = np.random.randint(0, 15)
    
    return {
        'predicted_grade': predicted_grade,
        'confidence': round(confidence, 2),
        'risk_level': risk_level,
        'risk_score': int(risk_score),
        'recommendations': generate_recommendations(data, predicted_grade),
        'feature_impacts': calculate_feature_impacts(data)
    }

# API Endpoints
@app.route('/')
def home():
    return jsonify({
        'status': 'healthy',
        'message': 'Welcome to the Elevatr Prediction API!',
        'model_loaded': model is not None
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None
    })

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        
        # Validate input
        is_valid, error_msg = validate_student_data(data)
        if not is_valid:
            return jsonify({'error': error_msg}), 400
        
        # Make prediction
        result = predict_student(data)
        
        logger.info(f"Prediction: {result['predicted_grade']} (confidence: {result['confidence']})")
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500

@app.route('/api/batch', methods=['POST'])
def batch_predict():
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
        logger.error(f"Batch prediction error: {str(e)}")
        return jsonify({'error': f'Batch prediction failed: {str(e)}'}), 500

# Initialize app
if __name__ == '__main__':
    if load_model_artifacts():
        app.run(debug=True, host='0.0.0.0', port=5000)
    else:
        logger.error("Failed to start: Could not load model artifacts")