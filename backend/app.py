from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, User, Material, Video
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Allows React (localhost:5173) to communicate with Flask (localhost:5000)
CORS(app) 

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# ==========================================
# 1. IDENTITY & ACCESS MANAGEMENT
# ==========================================

@app.route('/api/user/<uid>', methods=['GET'])
def get_profile(uid):
    try:
        user = User.query.filter_by(id=uid).first()
        if user:
            # Add a print statement here to see what Flask finds in your terminal
            print(f"User Found: {user.email}, Role: {user.role}") 
            return jsonify({
                "role": user.role, 
                "full_name": user.full_name,
                "email": user.email
            }), 200
        return jsonify({"error": "User not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/promote-user', methods=['POST'])
def promote_user():
    """Allows Admin to manually change roles (e.g., Student to Expert)."""
    data = request.json
    try:
        user = User.query.get(data['uid'])
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        user.role = data['new_role'] 
        db.session.commit()
        return jsonify({"message": f"User promoted to {data['new_role']}"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ==========================================
# 2. EXPERT: MANAGE STUDENTS
# ==========================================

@app.route('/api/expert/students', methods=['GET'])
def get_all_students():
    try:
        # Added a debug print to see what's happening in your terminal
        students = User.query.filter(User.role.ilike('student')).all()
        print(f"DEBUG: Found {len(students)} students in DB")
        
        return jsonify([{
            "id": str(s.id), # Ensure UUID is sent as a string
            "full_name": s.full_name,
            "email": s.email
        } for s in students]), 200
    except Exception as e:
        print(f"!!! BACKEND ERROR: {str(e)}")
        return jsonify({"error": str(e)}), 500

# ==========================================
# 3. CONTENT DELIVERY (STUDENT & EXPERT)
# ==========================================

@app.route('/api/materials', methods=['GET'])
def get_materials():
    """Fetches materials or syllabus based on type and category."""
    m_type = request.args.get('type', 'material') # 'material' or 'syllabus'
    category = request.args.get('category')
    
    query = Material.query.filter_by(content_type=m_type)
    if category: 
        query = query.filter_by(category=category)
    
    materials = query.all()
    return jsonify([{
        "id": m.id,
        "title": m.title,
        "subject": m.subject,
        "category": m.category,
        "file_url": m.file_url,
        "content_type": m.content_type
    } for m in materials]), 200

@app.route('/api/videos', methods=['GET'])
def get_videos():
    """Fetches all published videos with optional category filtering."""
    category = request.args.get('category')
    query = Video.query
    if category:
        query = query.filter_by(category=category)
        
    videos = query.all()
    return jsonify([{
        "id": v.id,
        "title": v.title,
        "description": v.description,
        "video_url": v.video_url,
        "subject": v.subject,
        "is_youtube": v.is_youtube
    } for v in videos]), 200

# ==========================================
# 4. EXPERT: UPLOAD & DELETE CONTENT
# ==========================================

@app.route('/api/expert/upload-content', methods=['POST'])
def upload_content():
    """Endpoint for uploading Syllabus and Material metadata."""
    data = request.json
    try:
        new_content = Material(
            title=data['title'],
            category=data['category'],
            subject=data['subject'],
            content_type=data['content_type'], 
            file_url=data['file_url'],
            uploaded_by=data['uploaded_by']
        )
        db.session.add(new_content)
        db.session.commit()
        return jsonify({"message": "Content uploaded successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/expert/upload-video', methods=['POST'])
def upload_video():
    """Endpoint for publishing YouTube or video links."""
    data = request.json
    try:
        new_video = Video(
            title=data['title'],
            category=data['category'],
            subject=data['subject'],
            video_url=data['video_url'],
            uploaded_by=data['uploaded_by']
        )
        db.session.add(new_video)
        db.session.commit()
        return jsonify({"message": "Video published successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/expert/delete-content/<int:id>', methods=['DELETE'])
def delete_content(id):
    """Removes material or syllabus entry by ID."""
    content = Material.query.get(id)
    if content:
        db.session.delete(content)
        db.session.commit()
        return jsonify({"message": "Deleted successfully"}), 200
    return jsonify({"error": "Not found"}), 404

@app.route('/api/expert/delete-video/<int:id>', methods=['DELETE'])
def delete_video(id):
    """Removes a video entry by ID."""
    video = Video.query.get(id)
    if video:
        db.session.delete(video)
        db.session.commit()
        return jsonify({"message": "Video deleted"}), 200
    return jsonify({"error": "Not found"}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5000)