# create_tables.py
import boto3
from botocore.exceptions import ClientError

def create_tables():
    """Create DynamoDB tables for the trading game"""
    dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
    
    tables_to_create = [
        {
            'TableName': 'OHLCV',
            'KeySchema': [
                {'AttributeName': 'Asset', 'KeyType': 'HASH'},  # Partition key
                {'AttributeName': 'Timestamp', 'KeyType': 'RANGE'}  # Sort key
            ],
            'AttributeDefinitions': [
                {'AttributeName': 'Asset', 'AttributeType': 'S'},
                {'AttributeName': 'Timestamp', 'AttributeType': 'N'}
            ],
            'BillingMode': 'PAY_PER_REQUEST'
        },
        {
            'TableName': 'News',
            'KeySchema': [
                {'AttributeName': 'Time', 'KeyType': 'HASH'}  # Partition key
            ],
            'AttributeDefinitions': [
                {'AttributeName': 'Time', 'AttributeType': 'N'}
            ],
            'BillingMode': 'PAY_PER_REQUEST'
        },
        {
            'TableName': 'Player',
            'KeySchema': [
                {'AttributeName': 'ID', 'KeyType': 'HASH'}  # Partition key
            ],
            'AttributeDefinitions': [
                {'AttributeName': 'ID', 'AttributeType': 'S'}
            ],
            'BillingMode': 'PAY_PER_REQUEST'
        },
        {
            'TableName': 'Status',
            'KeySchema': [
                {'AttributeName': 'ID', 'KeyType': 'HASH'}  # Partition key
            ],
            'AttributeDefinitions': [
                {'AttributeName': 'ID', 'AttributeType': 'S'}
            ],
            'BillingMode': 'PAY_PER_REQUEST'
        }
    ]
    
    for table_config in tables_to_create:
        try:
            table = dynamodb.create_table(**table_config)
            print(f"✅ Creating table {table_config['TableName']}...")
            table.wait_until_exists()
            print(f"✅ Table {table_config['TableName']} created successfully!")
        except ClientError as e:
            if e.response['Error']['Code'] == 'ResourceInUseException':
                print(f"⚠️ Table {table_config['TableName']} already exists")
            else:
                print(f"❌ Error creating table {table_config['TableName']}: {e}")

if __name__ == '__main__':
    print("��️ Creating DynamoDB tables...")
    create_tables()
    print("🎉 Done! All tables are ready.")