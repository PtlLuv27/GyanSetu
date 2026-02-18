from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import UUID
import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(UUID(as_uuid=True), primary_key=True)
    full_name = db.Column(db.String(100))
    email = db.Column(db.String(120), unique=True)
    role = db.Column(db.String(20), default='student')

class Material(db.Model):
    __tablename__ = 'materials'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(50)) 
    subject = db.Column(db.String(100))
    content_type = db.Column(db.String(20), default='material') 
    file_url = db.Column(db.Text)
    
    # ADD THESE TWO COLUMNS TO MATCH SUPABASE
    exam_year = db.Column(db.Integer)
    exam_name = db.Column(db.String(100))
    
    uploaded_by = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class Video(db.Model):
    __tablename__ = 'videos'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(50))
    subject = db.Column(db.String(100))
    video_url = db.Column(db.Text, nullable=False)
    is_youtube = db.Column(db.Boolean, default=True)
    uploaded_by = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class Question(db.Model):
    __tablename__ = 'questions'
    id = db.Column(db.Integer, primary_key=True)
    test_id = db.Column(db.Integer, db.ForeignKey('tests.id'))
    question_text = db.Column(db.Text, nullable=False)
    options = db.Column(db.JSON, nullable=False) # Use JSON for options list
    correct_answer = db.Column(db.Integer, nullable=False)
    explanation = db.Column(db.Text)
    subject = db.Column(db.String(100))