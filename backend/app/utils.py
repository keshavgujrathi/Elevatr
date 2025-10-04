import pandas as pd
import numpy as np
import joblib
import os
import logging
from typing import Dict, List, Tuple, Any

logger = logging.getLogger(__name__)


def load_model_assets() -> Tuple[Any, Any, Any, List[str]]:
    """
    Load all ML model artifacts from the models directory.
    
    Returns:
        Tuple of (model, scaler, label_encoder, feature_names)
        Returns (None, None, None, None) if loading fails
    """
    try:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        models_dir = os.path.join(base_dir, 'models')

        
        model = joblib.load(os.path.join(models_dir, 'elevatr_model.pkl'))
        scaler = joblib.load(os.path.join(models_dir, 'scaler.pkl'))
        label_encoder = joblib.load(os.path.join(models_dir, 'label_encoder.pkl'))
        
        # Feature order must match training pipeline
        feature_names = [
            'age', 'study_hours_weekly', 'attendance_percent', 
            'previous_gpa', 'assignments_completed', 'participation_score',
            'midterm_score', 'hours_on_platform', 'gender_encoded'
        ]
        
        logger.info("✓ Model assets loaded successfully")
        return model, scaler, label_encoder, feature_names
        
    except FileNotFoundError as e:
        logger.error(f"✗ Model file not found: {e}")
        return None, None, None, None
    except Exception as e:
        logger.error(f"✗ Failed to load model assets: {e}")
        return None, None, None, None


def preprocess_input(data: Dict, scaler: Any, feature_names: List[str]) -> np.ndarray:
    """
    Preprocess student data for model prediction.
    
    Args:
        data: Dictionary containing student features
        scaler: Fitted StandardScaler object
        feature_names: List of feature names in correct order
    
    Returns:
        Scaled numpy array ready for prediction
    """
    # Encode gender (F=0, M=1)
    gender_encoded = 0 if data.get('gender', 'M') == 'F' else 1
    
    # Build feature array in correct order
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
    
    return features_scaled


def generate_recommendations(
    student_data: Dict, 
    prediction: str, 
    confidence: float
) -> List[str]:
    """
    Generate personalized, actionable recommendations for student improvement.
    
    Args:
        student_data: Dictionary of student features
        prediction: Predicted grade (S/A/B/C/D/F)
        confidence: Model confidence (0-1)
    
    Returns:
        List of 3-5 recommendation strings
    """
    recommendations = []
    
    # Extract key metrics
    attendance = student_data['attendance_percent']
    study_hours = student_data['study_hours_weekly']
    assignments = student_data['assignments_completed']
    participation = student_data['participation_score']
    midterm = student_data['midterm_score']
    
    # Critical issues first (D/F grades)
    if prediction in ['D', 'F']:
        if attendance < 70:
            recommendations.append(
                f"🚨 URGENT: Attendance is {attendance:.0f}%. Aim for 80%+ immediately"
            )
        if assignments < 60:
            recommendations.append(
                f"📝 CRITICAL: Complete missing assignments (currently {assignments}%)"
            )
        if study_hours < 15:
            recommendations.append(
                f"⏰ Increase study time from {study_hours:.0f} to 20+ hours/week"
            )
        recommendations.append("💬 Schedule meeting with academic advisor for support plan")
    
    # Moderate concerns (C grade)
    elif prediction == 'C':
        if attendance < 80:
            recommendations.append(
                f"📊 Boost attendance from {attendance:.0f}% to 85%+ for better grades"
            )
        if study_hours < 20:
            recommendations.append(
                f"📚 Add {20 - study_hours:.0f} more study hours weekly for improvement"
            )
        if assignments < 80:
            recommendations.append(
                f"✅ Focus on assignment quality - currently at {assignments}%"
            )
        if participation < 60:
            recommendations.append(
                "🗣️ Increase class participation to demonstrate engagement"
            )
    
    # Optimization suggestions (B grade)
    elif prediction == 'B':
        if study_hours < 25 and attendance >= 80:
            recommendations.append(
                f"⭐ Add 3-5 study hours weekly to reach grade A (currently {study_hours:.0f}hrs)"
            )
        if assignments < 90:
            recommendations.append(
                "📈 Push assignment completion to 90%+ for top performance"
            )
        if participation < 75:
            recommendations.append(
                "💡 Increase participation score to 80+ for stronger overall profile"
            )
        recommendations.append("✓ Good foundation - small improvements can yield big results!")
    
    # Excellence maintenance (A/S grades)
    else:
        if attendance >= 90:
            recommendations.append("🌟 Excellent attendance - keep up the consistency!")
        if study_hours >= 25:
            recommendations.append("💪 Strong study habits - you're setting a great example")
        if assignments >= 90:
            recommendations.append("✓ Outstanding assignment completion rate")
        
        # Still provide growth opportunities
        if participation < 80:
            recommendations.append(
                "📣 Consider mentoring peers to further develop leadership skills"
            )
        elif midterm >= 85:
            recommendations.append("🏆 Top performer - maintain this momentum!")
    
    # Low confidence warning
    if confidence < 0.65:
        recommendations.append(
            "⚠️ Prediction confidence is moderate - focus on consistent improvement"
        )
    
    # Ensure we return 3-5 recommendations
    if not recommendations:
        recommendations.append("✓ All metrics look good - keep up the great work!")
    
    return recommendations[:5]


def calculate_risk_score(student_data: Dict) -> int:
    """
    Calculate student risk score based on multiple performance factors.
    
    Args:
        student_data: Dictionary containing student features
    
    Returns:
        Risk score (0-100), where higher values indicate more risk
    """
    risk_score = 0
    
    # Attendance impact (0-30 points)
    attendance = student_data['attendance_percent']
    if attendance < 50:
        risk_score += 30
    elif attendance < 70:
        risk_score += 20
    elif attendance < 80:
        risk_score += 10
    elif attendance < 90:
        risk_score += 5
    
    # Study hours impact (0-25 points)
    study_hours = student_data['study_hours_weekly']
    if study_hours < 10:
        risk_score += 25
    elif study_hours < 15:
        risk_score += 15
    elif study_hours < 20:
        risk_score += 8
    
    # Assignment completion impact (0-25 points)
    assignments = student_data['assignments_completed']
    if assignments < 50:
        risk_score += 25
    elif assignments < 70:
        risk_score += 18
    elif assignments < 80:
        risk_score += 10
    elif assignments < 90:
        risk_score += 5
    
    # Midterm performance impact (0-15 points)
    midterm = student_data['midterm_score']
    if midterm < 40:
        risk_score += 15
    elif midterm < 60:
        risk_score += 10
    elif midterm < 70:
        risk_score += 5
    
    # Participation impact (0-5 points)
    participation = student_data['participation_score']
    if participation < 50:
        risk_score += 5
    elif participation < 70:
        risk_score += 3
    
    # Previous academic performance (0-10 points)
    previous_gpa = student_data['previous_gpa']
    if previous_gpa < 6.0:
        risk_score += 10
    elif previous_gpa < 7.0:
        risk_score += 5
    
    # Cap at 100
    return min(risk_score, 100)


def get_feature_impact(student_data: Dict, model: Any = None) -> Dict[str, str]:
    """
    Analyze which features are positively or negatively impacting performance.
    
    Args:
        student_data: Dictionary containing student features
        model: Trained model (optional, used for feature importance if available)
    
    Returns:
        Dictionary mapping feature names to impact levels:
        'strong_positive', 'positive', 'neutral', 'negative', 'strong_negative'
    """
    impacts = {}
    
    # Attendance impact
    attendance = student_data['attendance_percent']
    if attendance >= 90:
        impacts['attendance_percent'] = 'strong_positive'
    elif attendance >= 80:
        impacts['attendance_percent'] = 'positive'
    elif attendance >= 70:
        impacts['attendance_percent'] = 'neutral'
    elif attendance >= 60:
        impacts['attendance_percent'] = 'negative'
    else:
        impacts['attendance_percent'] = 'strong_negative'
    
    # Study hours impact
    study_hours = student_data['study_hours_weekly']
    if study_hours >= 30:
        impacts['study_hours_weekly'] = 'strong_positive'
    elif study_hours >= 20:
        impacts['study_hours_weekly'] = 'positive'
    elif study_hours >= 15:
        impacts['study_hours_weekly'] = 'neutral'
    elif study_hours >= 10:
        impacts['study_hours_weekly'] = 'negative'
    else:
        impacts['study_hours_weekly'] = 'strong_negative'
    
    # Assignment completion impact
    assignments = student_data['assignments_completed']
    if assignments >= 90:
        impacts['assignments_completed'] = 'strong_positive'
    elif assignments >= 80:
        impacts['assignments_completed'] = 'positive'
    elif assignments >= 70:
        impacts['assignments_completed'] = 'neutral'
    elif assignments >= 60:
        impacts['assignments_completed'] = 'negative'
    else:
        impacts['assignments_completed'] = 'strong_negative'
    
    # Midterm score impact
    midterm = student_data['midterm_score']
    if midterm >= 85:
        impacts['midterm_score'] = 'strong_positive'
    elif midterm >= 70:
        impacts['midterm_score'] = 'positive'
    elif midterm >= 60:
        impacts['midterm_score'] = 'neutral'
    elif midterm >= 50:
        impacts['midterm_score'] = 'negative'
    else:
        impacts['midterm_score'] = 'strong_negative'
    
    # Participation impact
    participation = student_data['participation_score']
    if participation >= 80:
        impacts['participation_score'] = 'positive'
    elif participation >= 60:
        impacts['participation_score'] = 'neutral'
    else:
        impacts['participation_score'] = 'negative'
    
    # Previous GPA impact
    previous_gpa = student_data['previous_gpa']
    if previous_gpa >= 8.5:
        impacts['previous_gpa'] = 'strong_positive'
    elif previous_gpa >= 7.5:
        impacts['previous_gpa'] = 'positive'
    elif previous_gpa >= 6.5:
        impacts['previous_gpa'] = 'neutral'
    else:
        impacts['previous_gpa'] = 'negative'
    
    return impacts


def validate_student_data(data: Dict) -> Tuple[bool, str]:
    """
    Validate student input data for required fields and value ranges.
    
    Args:
        data: Dictionary containing student features
    
    Returns:
        Tuple of (is_valid: bool, error_message: str or None)
    """
    required_fields = [
        'age', 'gender', 'study_hours_weekly', 'attendance_percent',
        'previous_gpa', 'assignments_completed', 'participation_score',
        'midterm_score', 'hours_on_platform'
    ]
    
    # Check required fields
    for field in required_fields:
        if field not in data:
            return False, f"Missing required field: {field}"
    
    # Validate ranges
    validations = {
        'age': (18, 25, "Age must be between 18-25"),
        'study_hours_weekly': (5, 40, "Study hours must be between 5-40"),
        'attendance_percent': (0, 100, "Attendance must be between 0-100%"),
        'previous_gpa': (5.0, 10.0, "Previous GPA must be between 5.0-10.0"),
        'assignments_completed': (0, 100, "Assignments must be between 0-100%"),
        'participation_score': (0, 100, "Participation must be between 0-100"),
        'midterm_score': (0, 100, "Midterm score must be between 0-100"),
        'hours_on_platform': (10, 200, "Platform hours must be between 10-200")
    }
    
    for field, (min_val, max_val, error_msg) in validations.items():
        value = data[field]
        if not isinstance(value, (int, float)):
            return False, f"{field} must be a number"
        if not (min_val <= value <= max_val):
            return False, error_msg
    
    # Validate gender
    if data['gender'] not in ['M', 'F']:
        return False, "Gender must be 'M' or 'F'"
    
    return True, None
