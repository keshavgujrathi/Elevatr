import requests
import json
from datetime import datetime
from typing import Dict, Any

# API Configuration
API_BASE_URL = "http://localhost:5000/api"
OUTPUT_FILE = "backend/test_results.txt"

# Test student profiles
TEST_PROFILES = [
    {
        "name": "High Performer - Sarah",
        "description": "Excellent student with strong metrics across the board",
        "expected_grade": "S/A",
        "data": {
            "age": 21,
            "gender": "F",
            "study_hours_weekly": 32,
            "attendance_percent": 95,
            "previous_gpa": 9.2,
            "assignments_completed": 98,
            "participation_score": 90,
            "midterm_score": 92,
            "hours_on_platform": 150
        }
    },
    {
        "name": "Average Student - Rahul",
        "description": "Solid effort with room for improvement",
        "expected_grade": "B/C",
        "data": {
            "age": 20,
            "gender": "M",
            "study_hours_weekly": 18,
            "attendance_percent": 78,
            "previous_gpa": 7.2,
            "assignments_completed": 75,
            "participation_score": 65,
            "midterm_score": 68,
            "hours_on_platform": 85
        }
    },
    {
        "name": "At-Risk Student - Priya",
        "description": "Multiple concerning metrics requiring intervention",
        "expected_grade": "D/F",
        "data": {
            "age": 19,
            "gender": "F",
            "study_hours_weekly": 8,
            "attendance_percent": 55,
            "previous_gpa": 5.8,
            "assignments_completed": 45,
            "participation_score": 35,
            "midterm_score": 42,
            "hours_on_platform": 25
        }
    },
    {
        "name": "Efficient Learner - Arjun",
        "description": "Low study hours but naturally gifted with high scores",
        "expected_grade": "A/S",
        "data": {
            "age": 22,
            "gender": "M",
            "study_hours_weekly": 10,
            "attendance_percent": 72,
            "previous_gpa": 9.5,
            "assignments_completed": 82,
            "participation_score": 70,
            "midterm_score": 88,
            "hours_on_platform": 45
        }
    },
    {
        "name": "Struggling Despite Effort - Maya",
        "description": "High attendance and effort but poor performance",
        "expected_grade": "C/D",
        "data": {
            "age": 20,
            "gender": "F",
            "study_hours_weekly": 35,
            "attendance_percent": 92,
            "previous_gpa": 6.2,
            "assignments_completed": 88,
            "participation_score": 75,
            "midterm_score": 48,
            "hours_on_platform": 180
        }
    }
]


def print_header(text: str, char: str = "="):
    """Print a formatted header."""
    print(f"\n{char * 70}")
    print(f" {text}")
    print(f"{char * 70}\n")


def print_test_result(profile_name: str, result: Dict[str, Any], test_num: int):
    """Print formatted test result."""
    print(f"\n{'─' * 70}")
    print(f"Test {test_num}: {profile_name}")
    print(f"{'─' * 70}")
    
    # Prediction info
    grade = result.get('predicted_grade', 'N/A')
    confidence = result.get('confidence', 0) * 100
    risk_level = result.get('risk_level', 'unknown')
    risk_score = result.get('risk_score', 0)
    
    # Grade emoji
    grade_emoji = {
        'S': '🌟', 'A': '🎯', 'B': '📊', 
        'C': '⚠️', 'D': '🚨', 'F': '❌'
    }.get(grade, '❓')
    
    # Risk emoji
    risk_emoji = {'low': '✅', 'medium': '⚠️', 'high': '🚨'}.get(risk_level, '❓')
    
    print(f"{grade_emoji} Predicted Grade: {grade}")
    print(f"🎲 Confidence: {confidence:.1f}%")
    print(f"{risk_emoji} Risk Level: {risk_level.upper()} (Score: {risk_score}/100)")
    
    # Recommendations
    recommendations = result.get('recommendations', [])
    if recommendations:
        print(f"\n💡 Recommendations:")
        for i, rec in enumerate(recommendations, 1):
            print(f"   {i}. {rec}")
    
    # Feature impacts
    impacts = result.get('feature_impacts', {})
    if impacts:
        print(f"\n📈 Key Feature Impacts:")
        impact_symbols = {
            'strong_positive': '🟢🟢',
            'positive': '🟢',
            'neutral': '⚪',
            'negative': '🔴',
            'strong_negative': '🔴🔴'
        }
        for feature, impact in impacts.items():
            symbol = impact_symbols.get(impact, '❓')
            feature_display = feature.replace('_', ' ').title()
            print(f"   {symbol} {feature_display}: {impact.replace('_', ' ')}")


def test_health_check() -> bool:
    """Test the health check endpoint."""
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            status = data.get('status', 'unknown')
            model_loaded = data.get('model_loaded', False)
            
            if status == 'healthy' and model_loaded:
                print("✅ Health Check: PASS")
                print(f"   Status: {status}")
                print(f"   Model Loaded: {model_loaded}")
                return True
            else:
                print("❌ Health Check: FAIL (unhealthy or model not loaded)")
                return False
        else:
            print(f"❌ Health Check: FAIL (status code: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Health Check: FAIL (error: {str(e)})")
        return False


def test_prediction(profile: Dict) -> Dict[str, Any]:
    """Test prediction endpoint with a student profile."""
    try:
        response = requests.post(
            f"{API_BASE_URL}/predict",
            json=profile['data'],
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            error_data = response.json() if response.content else {}
            return {
                'error': f"API returned status {response.status_code}",
                'details': error_data.get('error', 'Unknown error')
            }
    except Exception as e:
        return {'error': str(e)}


def test_batch_prediction() -> bool:
    """Test batch prediction endpoint."""
    print("\n" + "─" * 70)
    print("Bonus Test: Batch Prediction")
    print("─" * 70)
    
    try:
        # Send first 3 profiles as batch
        batch_data = [profile['data'] for profile in TEST_PROFILES[:3]]
        
        response = requests.post(
            f"{API_BASE_URL}/batch",
            json=batch_data,
            headers={'Content-Type': 'application/json'},
            timeout=15
        )
        
        if response.status_code == 200:
            results = response.json()
            print(f"✅ Batch Prediction: PASS")
            print(f"   Processed {len(results)} students successfully")
            
            # Show summary
            grades = [r.get('predicted_grade', 'N/A') for r in results if 'predicted_grade' in r]
            print(f"   Predicted grades: {', '.join(grades)}")
            return True
        else:
            print(f"❌ Batch Prediction: FAIL (status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ Batch Prediction: FAIL (error: {str(e)})")
        return False


def save_results_to_file(results: Dict, filename: str):
    """Save test results to a text file."""
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            f.write("=" * 70 + "\n")
            f.write(" ELEVATR API TEST RESULTS\n")
            f.write(f" Test Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write("=" * 70 + "\n\n")
            
            # Health check
            f.write("HEALTH CHECK\n")
            f.write("-" * 70 + "\n")
            f.write(f"Status: {'PASS' if results['health_check'] else 'FAIL'}\n\n")
            
            # Individual tests
            for i, (profile_name, result) in enumerate(results['predictions'].items(), 1):
                f.write(f"\nTEST {i}: {profile_name}\n")
                f.write("-" * 70 + "\n")
                
                if 'error' in result:
                    f.write(f"ERROR: {result['error']}\n")
                    if 'details' in result:
                        f.write(f"Details: {result['details']}\n")
                else:
                    f.write(f"Predicted Grade: {result.get('predicted_grade', 'N/A')}\n")
                    f.write(f"Confidence: {result.get('confidence', 0) * 100:.1f}%\n")
                    f.write(f"Risk Level: {result.get('risk_level', 'unknown').upper()}\n")
                    f.write(f"Risk Score: {result.get('risk_score', 0)}/100\n\n")
                    
                    f.write("Recommendations:\n")
                    for j, rec in enumerate(result.get('recommendations', []), 1):
                        f.write(f"  {j}. {rec}\n")
                    
                    f.write("\nFeature Impacts:\n")
                    for feature, impact in result.get('feature_impacts', {}).items():
                        f.write(f"  - {feature}: {impact}\n")
                f.write("\n")
            
            # Batch test
            f.write("\nBATCH PREDICTION TEST\n")
            f.write("-" * 70 + "\n")
            f.write(f"Status: {'PASS' if results['batch_test'] else 'FAIL'}\n")
            
            # Summary
            f.write("\n" + "=" * 70 + "\n")
            f.write("TEST SUMMARY\n")
            f.write("=" * 70 + "\n")
            total_tests = len(results['predictions']) + 2  # +2 for health and batch
            passed_tests = sum([
                results['health_check'],
                results['batch_test'],
                sum(1 for r in results['predictions'].values() if 'error' not in r)
            ])
            f.write(f"Total Tests: {total_tests}\n")
            f.write(f"Passed: {passed_tests}\n")
            f.write(f"Failed: {total_tests - passed_tests}\n")
            f.write(f"Success Rate: {passed_tests/total_tests*100:.1f}%\n")
        
        print(f"\n💾 Results saved to: {filename}")
        return True
    except Exception as e:
        print(f"\n❌ Failed to save results: {str(e)}")
        return False


def main():
    """Run all API tests."""
    print_header("🧪 TESTING ELEVATR API", "=")
    
    # Store results
    test_results = {
        'health_check': False,
        'predictions': {},
        'batch_test': False
    }
    
    # Test 1: Health check
    print_header("1. Health Check Endpoint", "-")
    test_results['health_check'] = test_health_check()
    
    if not test_results['health_check']:
        print("\n⚠️ API is not healthy. Check if the server is running:")
        print("   cd backend/app && python main.py")
        return
    
    # Test 2: Individual predictions
    print_header("2. Prediction Endpoint Tests", "-")
    
    for i, profile in enumerate(TEST_PROFILES, 1):
        print(f"\n📝 Testing: {profile['name']}")
        print(f"   Description: {profile['description']}")
        print(f"   Expected: {profile['expected_grade']}")
        
        result = test_prediction(profile)
        test_results['predictions'][profile['name']] = result
        
        if 'error' in result:
            print(f"   ❌ Test FAILED: {result['error']}")
            if 'details' in result:
                print(f"   Details: {result['details']}")
        else:
            print_test_result(profile['name'], result, i)
    
    # Test 3: Batch prediction
    print_header("3. Batch Prediction Test", "-")
    test_results['batch_test'] = test_batch_prediction()
    
    # Summary
    print_header("📊 TEST SUMMARY", "=")
    total_tests = len(TEST_PROFILES) + 2
    passed_tests = sum([
        test_results['health_check'],
        test_results['batch_test'],
        sum(1 for r in test_results['predictions'].values() if 'error' not in r)
    ])
    failed_tests = total_tests - passed_tests
    
    print(f"Total Tests Run: {total_tests}")
    print(f"✅ Passed: {passed_tests}")
    print(f"❌ Failed: {failed_tests}")
    print(f"Success Rate: {passed_tests/total_tests*100:.1f}%")
    
    # Save results
    save_results_to_file(test_results, OUTPUT_FILE)
    
    print("\n" + "=" * 70)
    print(" Testing Complete!")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️ Tests interrupted by user")
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")