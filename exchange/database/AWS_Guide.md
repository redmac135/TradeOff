# Simple AWS Setup Guide

## What You Need
- Computer with internet
- 10 minutes of time
- Credit card (for AWS account - but we'll use free tier)

## Step 1: Create AWS Account (5 minutes)

### 1.1 Go to AWS
- Open browser
- Go to: https://aws.amazon.com
- Click "Create an AWS Account"

### 1.2 Fill Out Form
- **Email**: Use your email
- **Password**: Create a strong password
- **Account name**: "My Trading Game" (or whatever you want)

### 1.3 Add Payment Info
- **Don't worry!** We'll use the FREE tier
- AWS gives you $200 free credit for 12 months
- Our project will cost less than $1 per month

### 1.4 Verify Phone
- Enter your phone number
- AWS will call you with a code
- Enter the code when prompted

### 1.5 Choose Support Plan
- Select "Basic Support - Free"
- Click "Complete sign up"

**✅ You now have an AWS account!**

## Step 2: Get Your AWS Keys (3 minutes)

### 2.1 Go to IAM (Identity and Access Management)
- In AWS Console, search "IAM"
- Click on IAM

### 2.2 Create a User
- Click "Users" in left menu
- Click "Create user"
- **User name**: "trading-game-user"
- Click "Next"

### 2.3 Attach Policy
- Search for "DynamoDB"
- Check "AmazonDynamoDBFullAccess"
- Click "Next"
- Click "Create user"

### 2.4 Get Your Keys
- Click on your new user
- Click "Security credentials" tab
- Click "Create access key"
- Choose "Application running outside AWS"
- Click "Next"
- **IMPORTANT**: Copy these keys somewhere safe!
  - Access Key ID: `AKIA...` (starts with AKIA)
  - Secret Access Key: `...` (long random string)

**✅ You now have AWS keys!**

## Step 3: Install AWS CLI (2 minutes)

### 3.1 Download AWS CLI
- Go to: https://aws.amazon.com/cli/
- Download for your operating system
- Install it (just click through the installer)

### 3.2 Configure AWS CLI
Open Command Prompt (Windows) or Terminal (Mac/Linux):

```bash
aws configure
```

Enter your information:
- **AWS Access Key ID**: `AKIA...` (from step 2.4)
- **AWS Secret Access Key**: `...` (from step 2.4)
- **Default region**: `us-east-1`
- **Default output format**: `json`

**✅ AWS CLI is configured!**

## Step 4: Test Everything Works

### 4.1 Test AWS Connection
```bash
aws sts get-caller-identity
```

You should see something like:
```json
{
    "UserId": "AIDACKCEVSQ6C2EXAMPLE",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/trading-game-user"
}
```

### 4.2 Test DynamoDB
```bash
aws dynamodb list-tables
```

You should see:
```json
{
    "TableNames": []
}
```

**✅ Everything is working!**

## Step 5: Run Your Project

### 5.1 Install Python Dependencies
```bash
pip install boto3 flask flask-cors
```

### 5.2 Run the Project
```bash
# Start the API
python api.py

# In another terminal, start data generator
python data_generator.py

# In another terminal, start frontend
cd tradeOff
npm run dev
```

## What Happens Next

1. **Your project creates tables automatically** in AWS DynamoDB
2. **Data gets stored** in the cloud
3. **Your team can access** the same data
4. **Everything works** in real-time

## Troubleshooting

### "No credentials found"
- Run `aws configure` again
- Make sure you copied the keys correctly

### "Access denied"
- Check that you attached the DynamoDB policy in step 2.3

### "Region not found"
- Make sure you used `us-east-1` as the region

## Cost Estimate

- **DynamoDB**: $0.25 per million requests
- **Our project**: ~1000 requests per day
- **Monthly cost**: Less than $1

## Team Setup

To share with your team:
1. **Share this guide** with them
2. **Each person** creates their own AWS account
3. **Use the same region** (`us-east-1`)
4. **Run the same code** - it will work!

## Quick Commands

```bash
# Check if AWS is working
aws sts get-caller-identity

# List your tables
aws dynamodb list-tables

# See table contents
aws dynamodb scan --table-name Players

# Delete everything (if you want to start over)
aws dynamodb delete-table --table-name Players
aws dynamodb delete-table --table-name OHLCV
aws dynamodb delete-table --table-name News
aws dynamodb delete-table --table-name Status
```

## That's It!

You now have:
- ✅ AWS account
- ✅ DynamoDB access
- ✅ Working project
- ✅ Team can join

**Total time: 10 minutes**
**Total cost: $0 (using free tier)**