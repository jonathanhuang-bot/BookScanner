from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import base64
import tempfile
import os
import uuid
from ai_services import analyze_bookshelf, generate_recommendations, load_goodreads_preferences, extract_goodreads_preferences
from database import (
    get_or_create_user,
    save_user_preferences,
    save_analysis_session,
    get_user_analysis_history,
    create_tables
)

app = Flask(__name__)
CORS(app, supports_credentials=True)  # Enable cookies for CORS

try:
    create_tables()
    print("✅ Database tables created successfully")
except Exception as e:
    print(f"❌ Database connection failed: {e}")

def ensure_device_id():
    """Ensure every request has a device ID - ShelfScanner approach"""
    # 1. Check cookie first (primary method)
    device_id = request.cookies.get('deviceId')
    
    # 2. Fallback to X-Device-ID header
    if not device_id:
        device_id = request.headers.get('X-Device-ID')
    
    # 3. Last resort: generate server-side UUID
    if not device_id:
        device_id = str(uuid.uuid4())
        print(f"⚠️  Generated server-side device ID: {device_id[:8]}...")
    else:
        print(f"🆔 Using device ID: {device_id[:8]}...")
    
    # Store in request object for route access
    request.device_id = device_id
    return device_id

@app.before_request
def before_request():
    """Run before every request to ensure device ID"""
    # Skip device ID for health check
    if request.endpoint == 'health_check':
        return
    
    ensure_device_id()

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'Server is running!'})

@app.route('/analyze', methods=['POST'])
def analyze_image():
    try:
        data = request.get_json()
        image_base64 = data["image"]
        preferences = data["preferences"]

        # Get device ID from middleware (no generation needed!)
        device_id = request.device_id
        
        # Get or create user in database
        user = get_or_create_user(device_id)
        print(f"🔄 Processing request for user: {user['id']}")

        # Save preferences to database
        saved_prefs = save_user_preferences(user['id'], preferences)
        print(f"💾 Saved preferences: {len(saved_prefs['favorite_authors'])} authors, {len(saved_prefs['preferred_genres'])} genres")
        
        # Analyze image (unchanged)
        detected_books = analyze_bookshelf(image_base64)
        print(f"📚 Detected {len(detected_books)} books")

        # Generate recommendations (unchanged)
        recommendations = generate_recommendations(preferences, detected_books)
        print(f"⭐ Generated {len(recommendations)} recommendations")
        
        # Save analysis session to database
        analysis = save_analysis_session(user['id'], detected_books, recommendations)
        print(f"💽 Saved analysis session: {analysis['id']}")

        # Create response with device ID cookie
        response_data = {
            'detected_books': detected_books,
            'recommendations': recommendations,
            'user_id': user['id'],
            'session_id': analysis['id']
        }
        
        response = make_response(jsonify(response_data))
        
        # Set/refresh device ID cookie (1 year expiration)
        response.set_cookie(
            'deviceId', 
            device_id,
            max_age=365*24*60*60,  # 1 year in seconds
            path='/',
            samesite='Strict',
            httponly=False,  # Allow JavaScript access
            secure=False  # Set to True in production with HTTPS
        )
        
        return response
    except Exception as e:
        print(f"❌ Error in /analyze: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/process-goodreads', methods=['POST'])
def process_goodreads():
    try:
        print("📖 Received Goodreads CSV upload")

        if 'goodreads_csv' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400

        file = request.files['goodreads_csv']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        print(f"📁 File received: {file.filename}")

        # Get device ID from middleware
        device_id = request.device_id
        
        # Get or create user
        user = get_or_create_user(device_id)
        print(f"👤 Processing Goodreads for user: {user['id']}")
        
        # Process CSV (unchanged)
        preferences = extract_goodreads_preferences(file)
        print(f"📊 Extracted preferences: {len(preferences.get('authors', []))} authors, {len(preferences.get('genres', []))} genres")
        
        # Save to database with raw Goodreads data
        preferences['goodreads_raw'] = preferences.copy()  # Keep original data
        saved_prefs = save_user_preferences(user['id'], preferences)
        
        # Create response with device ID cookie
        response_data = preferences.copy()
        response_data['user_id'] = user['id']
        
        response = make_response(jsonify(response_data))
        
        # Set/refresh device ID cookie
        response.set_cookie(
            'deviceId', 
            device_id,
            max_age=365*24*60*60,  # 1 year in seconds
            path='/',
            samesite='Strict',
            httponly=False,
            secure=False  # Set to True in production with HTTPS
        )
        
        return response
        
    except Exception as e:
        print(f"❌ Error processing Goodreads: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/history', methods=['GET'])
def get_history():
    """Get user's analysis history"""
    try:
        # Get device ID from middleware
        device_id = request.device_id
        
        # Get or create user (finds existing user)
        user = get_or_create_user(device_id)
        print(f"📜 Getting history for user: {user['id']}")
        
        # Get analysis history
        sessions = get_user_analysis_history(user['id'], limit=20)
        
        # Convert to JSON-serializable format
        history = []
        for session in sessions:
            history.append({
                'session_id': str(session.id),
                'created_at': session.created_at.isoformat(),
                'detected_books_count': len(session.detected_books),
                'recommendations_count': len(session.recommendations),
                'detected_books': session.detected_books,
                'recommendations': session.recommendations
            })
        
        response_data = {
            'user_id': user['id'],
            'history': history,
            'total_sessions': len(history)
        }
        
        response = make_response(jsonify(response_data))
        
        # Set/refresh device ID cookie
        response.set_cookie(
            'deviceId', 
            device_id,
            max_age=365*24*60*60,
            path='/',
            samesite='Strict',
            httponly=False,
            secure=False
        )
        
        return response
        
    except Exception as e:
        print(f"❌ Error getting history: {str(e)}")
        return jsonify({'error': str(e)}), 500
if __name__ == "__main__":
    app.run(debug=True, port = 5000)