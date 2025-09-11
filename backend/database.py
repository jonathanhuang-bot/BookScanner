from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.types import Boolean
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

class SavedBooks(Base):
    __tablename__ = "saved_books"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(UUID(as_uuid=True), nullable=False)  # Links to User.id
    title = Column(String, nullable=False)
    author = Column(String, nullable=False)
    match_score = Column(Integer)  # Original match score when recommended
    match_reason = Column(Text)    # Why it was recommended
    source_session_id = Column(UUID(as_uuid=True))  # Which analysis session it came from
    additional_notes = Column(Text)  # User can add personal notes
    saved_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    is_read = Column(Boolean, default=False)  # User can mark as read later

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

def save_book(user_id: str, title: str, author: str, match_score: int = None, match_reason: str = None, source_session_id: str = None):
    db = SessionLocal()
    try:
        book = db.query(SavedBooks).filter(
            SavedBooks.user_id == user_id,
            SavedBooks.title == title,
            SavedBooks.author == author
        ).first()

        if book:
            return {"already_saved": True, "message": "Book already in reading list"}
        else:
            new_book = SavedBooks(
                user_id=user_id,
                title=title,
                author=author,
                match_score=match_score,
                match_reason=match_reason,
                source_session_id=source_session_id
            )
            db.add(new_book)
            db.commit()
            db.refresh(new_book)
            return {"success": True, "message": "Book saved successfully", "book_id": new_book.id}
    except Exception as e:
        db.rollback()  # Undo any partial changes
        return {"success": False, "message": f"Failed to save book: {str(e)}"}
    finally:
        db.close()


def unsave_book(user_id: str, title: str, author: str):
    db = SessionLocal()
    try:
        book = db.query(SavedBooks).filter(
            SavedBooks.user_id == user_id,
            SavedBooks.title == title,
            SavedBooks.author == author
        ).first()
        if book:
            db.delete(book)
            db.commit()
            return {"success": True, "message": "Book removed from reading list"}
        else:
            return {"success": False, "message": "Book not found in reading list"}
    except Exception as e:
        db.rollback()
        return {"success": False, "message": f"Failed to remove book: {str(e)}"}
    finally:
        db.close()

def get_saved_books(user_id: str, limit: int = 50):
    db = SessionLocal()
    try:
        books = db.query(SavedBooks)\
                 .filter(SavedBooks.user_id == user_id)\
                 .order_by(SavedBooks.saved_at.desc())\
                 .limit(limit)\
                 .all()
        
        # Convert to dictionaries for safe return
        result = []
        for book in books:
            result.append({
                'id': book.id,
                'user_id': str(book.user_id),
                'title': book.title,
                'author': book.author,
                'match_score': book.match_score,
                'match_reason': book.match_reason,
                'source_session_id': str(book.source_session_id) if book.source_session_id else None,
                'additional_notes': book.additional_notes,
                'saved_at': book.saved_at.isoformat() if book.saved_at else None,
                'is_read': book.is_read
            })
        return result
    finally:
        db.close()

def check_if_book_saved(user_id: str, title: str, author: str):
    db = SessionLocal()
    try:
        book = db.query(SavedBooks).filter(
            SavedBooks.user_id == user_id,
            SavedBooks.title == title,
            SavedBooks.author == author
        ).first()
        return book is not None
    finally:
        db.close()

def mark_book_as_read(user_id: str, book_id: int, is_read: bool = True):
    db = SessionLocal()
    try:
        book = db.query(SavedBooks).filter(
            SavedBooks.user_id == user_id,
            SavedBooks.id == book_id
        ).first()
        
        if book:
            book.is_read = is_read
            db.commit()
            return {"success": True, "message": f"Book marked as {'read' if is_read else 'unread'}"}
        else:
            return {"success": False, "message": "Book not found"}
    except Exception as e:
        db.rollback()
        return {"success": False, "message": f"Failed to update book status: {str(e)}"}
    finally:
        db.close()

def update_book_notes(user_id: str, book_id: int, notes: str):
    db = SessionLocal()
    try:
        book = db.query(SavedBooks).filter(
            SavedBooks.user_id == user_id,
            SavedBooks.id == book_id
        ).first()
        if book:
            book.additional_notes = notes
            db.commit()
            return {"success": True, "message": f"Notes saved successfully"}
        else:
            return {"success": False, "message": "Book not found"}
    except Exception as e:
        db.rollback()
        return {"success": False, "message": f"Failed to update book notes: {str(e)}"}
    finally:
        db.close()