from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime, timezone
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key = True, default = uuid.uuid4)
    device_id = Column(String, unique = True, nullable = False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_active = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class UserPreferences(Base):
    __tablename__ = "user_preferences"
    id = Column(Integer, primary_key = True, autoincrement = True)
    user_id = Column(UUID(as_uuid=True), nullable = False)
    favorite_authors = Column(JSON)
    preferred_genres = Column(JSON)
    avoid_elements = Column(Text)
    goodreads_data = Column(JSON)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class AnalysisSession(Base):
    __tablename__ = "analysis_sessions"
    id = Column(UUID(as_uuid=True), primary_key=True, default = uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable = False)
    image_filename = Column(String)
    detected_books = Column(JSON)
    recommendations = Column(JSON)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class BookCache(Base):
    __tablename__ = "book_cache"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String, nullable=False)
    author = Column(String, nullable=False)
    book_metadata = Column(JSON)  # Additional book info - renamed from 'metadata'
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime)  # When cache expires

def create_tables():
    Base.metadata.create_all(bind=engine)

def get_or_create_user(device_id: str):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.device_id==device_id).first()
        if not user:
            user = User(device_id=device_id)
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            user.last_active = datetime.now(timezone.utc)
            db.commit()
            db.refresh(user)
        
        # Create a detached copy to return (safe to use outside session)
        result = {
            'id': str(user.id),
            'device_id': user.device_id,
            'created_at': user.created_at.isoformat() if user.created_at else None,
            'last_active': user.last_active.isoformat() if user.last_active else None
        }
        return result
    finally:
        db.close()

def save_user_preferences(user_id: str, preferences: dict):
    db = SessionLocal()
    try:
        prefs = db.query(UserPreferences).filter(UserPreferences.user_id == user_id).first()
        if prefs:
            prefs.favorite_authors = preferences.get('authors', [])
            prefs.preferred_genres = preferences.get('genres', [])
            prefs.avoid_elements = preferences.get('avoid', '')  # Fixed: was getting list instead of string
            prefs.goodreads_data = preferences.get('goodreads_raw', {})
            prefs.updated_at = datetime.now(timezone.utc)
        else:
            prefs = UserPreferences(
                user_id=user_id,
                favorite_authors=preferences.get('authors', []),
                preferred_genres=preferences.get('genres', []),
                avoid_elements=preferences.get('avoid', ''),
                goodreads_data=preferences.get('goodreads_raw', {}),
            )
            db.add(prefs)
        
        db.commit()
        db.refresh(prefs)  # Refresh to get updated data
        
        # Create a detached copy to return (safe to use outside session)
        result = {
            'id': prefs.id,
            'user_id': str(prefs.user_id),
            'favorite_authors': prefs.favorite_authors or [],
            'preferred_genres': prefs.preferred_genres or [],
            'avoid_elements': prefs.avoid_elements or '',
            'goodreads_data': prefs.goodreads_data or {},
            'updated_at': prefs.updated_at.isoformat() if prefs.updated_at else None
        }
        return result
    finally:
        db.close()

def save_analysis_session(user_id: str, detected_books: list, recommendations: list):
    db = SessionLocal()
    try:
        session = AnalysisSession(
            user_id = user_id,
            detected_books = detected_books,
            recommendations = recommendations
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        
        # Create a detached copy to return (safe to use outside session)
        result = {
            'id': str(session.id),
            'user_id': str(session.user_id),
            'detected_books': session.detected_books,
            'recommendations': session.recommendations,
            'created_at': session.created_at.isoformat() if session.created_at else None
        }
        return result
    finally:
        db.close()

def get_user_analysis_history(user_id: str, limit: int = 10):
    db = SessionLocal()
    try:
        sessions = db.query(AnalysisSession)\
                    .filter(AnalysisSession.user_id == user_id)\
                    .order_by(AnalysisSession.created_at.desc())\
                    .limit(limit)\
                    .all()
        return sessions
    finally:
        db.close()
