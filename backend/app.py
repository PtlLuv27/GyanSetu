from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, User, Material, Video
from dotenv import load_dotenv
import os
import requests
import io
import PyPDF2
from google import genai # New SDK import
from google.genai import types # For configuration types
from google.api_core import exceptions
from sqlalchemy import text
import json

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Middleware
CORS(app) 

# 2. Use environment variables for sensitive configurations
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# 3. Securely initialize the Gemini Client using the key from .env
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_KEY)

# Initialize Modern Gemini Client
# Replaces genai.configure and genai.GenerativeModel
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def process_pdf_for_ai(material_id, file_url):
    try:
        # Download the PDF from the Supabase Public URL
        response = requests.get(file_url)
        if response.status_code == 200:
            pdf_file = io.BytesIO(response.content)
            reader = PyPDF2.PdfReader(pdf_file)
            
            # Extract text from the first few pages (to avoid token limits)
            text_content = ""
            for i in range(min(len(reader.pages), 5)):
                text_content += reader.pages[i].extract_text()
            
            # Optional: Log that text was extracted or save to a 'search_index' column
            print(f"Successfully indexed PDF for Material ID: {material_id}")
            # Here you could update the database with the extracted text if needed
            
    except Exception as e:
        print(f"Error processing PDF {material_id}: {str(e)}")

@app.route('/api/test/<int:test_id>/questions', methods=['GET'])
def get_test_questions(test_id):
    try:
        query = text("""
            SELECT question_text, options, correct_answer, explanation 
            FROM questions 
            WHERE test_id = :tid
        """)
        result = db.session.execute(query, {"tid": test_id}).fetchall()
        
        return jsonify([{
            "question": r[0], "options": r[1], 
            "correct_answer": r[2], "explanation": r[3]
        } for r in result]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/test/submit', methods=['POST'])
def submit_test():
    data = request.json
    try:
        new_attempt = text("""
            INSERT INTO test_attempts (user_id, test_id, score, accuracy)
            VALUES (:uid, :tid, :score, :acc)
        """)
        db.session.execute(new_attempt, {
            "uid": data['user_id'],
            "tid": data['test_id'],
            "score": data['score'],
            "acc": data['accuracy']
        })
        db.session.commit()
        return jsonify({"message": "Result saved!"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/ai/generate-test', methods=['POST'])
def generate_test():
    data = request.json
    subject = data.get('subject', 'Indian Polity')

    try:
        # Changed table name to 'questions' to match your schema
        query = text("""
            SELECT question_text, options, correct_answer, explanation 
            FROM questions 
            WHERE subject = :sub 
            ORDER BY RANDOM() 
            LIMIT 5
        """)
        
        result = db.session.execute(query, {"sub": subject}).fetchall()

        if not result:
            return jsonify({"error": f"No questions found for {subject} in the database."}), 404

        # Format the result into the JSON structure your frontend expects
        questions = []
        for row in result:
            questions.append({
                "question": row[0],
                "options": row[1], # Assumes options is a JSONB/List column
                "correct_answer": row[2],
                "explanation": row[3]
            })

        return jsonify(questions), 200

    except Exception as e:
        print(f"Database Fetch Error: {str(e)}")
        return jsonify({"error": "Failed to fetch questions from database"}), 500

@app.route('/api/pyp', methods=['GET'])
def get_pyp():
    try:
        # ilike ignores case and is safer for PostgreSQL
        papers = Material.query.filter(Material.content_type.ilike('pyp')).all()
        
        print(f"DEBUG: Found {len(papers)} papers in DB") # Check your terminal for this!
        
        return jsonify([{
            "id": p.id,
            "title": p.title,
            "subject": p.subject,
            "exam_name": p.exam_name,
            "exam_year": p.exam_year,
            "category": p.category,
            "file_url": p.file_url
        } for p in papers]), 200
    except Exception as e:
        print(f"DATABASE ERROR: {str(e)}")
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/ai/ask', methods=['POST'])
def ask_ai_tutor():
    data = request.json
    user_query = data.get('query')
    
    if not user_query:
        return jsonify({"error": "No query provided"}), 400

    try:
        # Using the exact model name from your 'list_models' results
        response = client.models.generate_content(
            model="models/gemini-2.5-flash-lite",
            contents=user_query,
            config=types.GenerateContentConfig(
                system_instruction="You are the GyanSetu AI Tutor. Provide helpful GPSC advice."
            )
        )
        
        return jsonify({"answer": response.text}), 200

    except Exception as e:
        # THIS PRINT IS CRITICAL: Check your terminal for this output!
        print(f"--- DETAILED ERROR LOG ---")
        print(str(e))
        return jsonify({"error": "AI Tutor encountered a problem. Check server logs."}), 500

# ==========================================
# 2. IDENTITY, ACCESS & MANAGEMENT
# ==========================================

@app.route('/api/user/<uid>', methods=['GET'])
def get_profile(uid):
    try:
        user = User.query.filter_by(id=uid).first()
        if user:
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

@app.route('/api/expert/students', methods=['GET'])
def get_all_students():
    try:
        students = User.query.filter(User.role.ilike('student')).all()
        return jsonify([{
            "id": str(s.id),
            "full_name": s.full_name,
            "email": s.email
        } for s in students]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==========================================
# 3. CONTENT DELIVERY & UPLOAD
# ==========================================

@app.route('/api/materials', methods=['GET'])
def get_materials():
    m_type = request.args.get('type', 'material')
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

@app.route('/api/expert/upload-content', methods=['POST'])
def upload_content():
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
        db.session.flush() 
        if data['file_url'].lower().endswith('.pdf'):
            process_pdf_for_ai(new_content.id, data['file_url'])
        db.session.commit()
        return jsonify({"message": f"{data['content_type']} uploaded and indexed"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@app.route('/api/expert/upload-video', methods=['POST'])
def upload_video():
    data = request.json
    try:
        user = User.query.get(data['uploaded_by'])
        if not user or user.role not in ['expert', 'admin']:
            return jsonify({"error": "Unauthorized"}), 403
        new_video = Video(
            title=data['title'],
            category=data['category'],
            subject=data['subject'],
            video_url=data['video_url'],
            uploaded_by=data['uploaded_by']
        )
        db.session.add(new_video)
        db.session.commit()
        return jsonify({"message": "Video published"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/expert/delete-content/<int:id>', methods=['DELETE'])
def delete_content(id):
    content = Material.query.get(id)
    if content:
        db.session.delete(content)
        db.session.commit()
        return jsonify({"message": "Deleted successfully"}), 200
    return jsonify({"error": "Not found"}), 404

@app.route('/api/expert/delete-video/<int:id>', methods=['DELETE'])
def delete_video(id):
    video = Video.query.get(id)
    if video:
        db.session.delete(video)
        db.session.commit()
        return jsonify({"message": "Video deleted"}), 200
    return jsonify({"error": "Not found"}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5000)