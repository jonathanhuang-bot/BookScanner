#!/usr/bin/env python3
"""
Quick test script to verify database connection
"""
import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

def test_database_connection():
    db_url = os.getenv('DATABASE_URL')
    if not db_url:
        print("❌ No DATABASE_URL found in .env file")
        return False
    
    try:
        print(f"🔌 Testing connection to: {db_url.split('@')[1] if '@' in db_url else 'database'}")
        
        engine = create_engine(db_url)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            print(f"✅ Connected successfully!")
            print(f"📦 PostgreSQL version: {version[:50]}...")
            return True
            
    except Exception as e:
        print(f"❌ Connection failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("🧪 Database Connection Test")
    print("-" * 40)
    success = test_database_connection()
    
    if success:
        print("\n🎉 Database is ready for deployment!")
    else:
        print("\n💡 Please check your DATABASE_URL in the .env file")