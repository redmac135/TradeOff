# connect_to_db.py
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from exchange.classes.DBHandler import DBHandler
import time

def test_connection():
    """Test connection to DynamoDB"""
    print("🔌 Testing DynamoDB connection...")
    
    # Test with your schema (not Gemini's)
    db = DBHandler(use_gemini_schema=False)
    
    # Test pushing data
    test_data = {
        'open': 100.0,
        'high': 105.0,
        'low': 95.0,
        'close': 102.0,
        'volume': 1000.0
    }
    
    success = db.push_candle_data(test_data)
    if success:
        print("✅ Successfully connected to DynamoDB!")
    else:
        print("❌ Failed to connect to DynamoDB")

if __name__ == '__main__':
    test_connection()