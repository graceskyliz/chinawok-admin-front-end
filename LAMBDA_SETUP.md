# 🚀 AWS Lambda Deployment Guide

## Current Setup

The frontend is configured to work with AWS Lambda functions via API Gateway. The API base URL is configurable through environment variables.

## Configuration Steps

### 1. Development (Local Testing)
Currently set in `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### 2. When Your Lambda Functions Are Deployed

After deploying your Lambda functions to AWS, you'll get an API Gateway URL. Update your `.env.local` or `.env.production`:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-api-id.execute-api.region.amazonaws.com/prod
```

**Example URLs:**
```env
# US East 1
NEXT_PUBLIC_API_BASE_URL=https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod

# US West 2
NEXT_PUBLIC_API_BASE_URL=https://abc123xyz.execute-api.us-west-2.amazonaws.com/prod

# With custom stage name
NEXT_PUBLIC_API_BASE_URL=https://abc123xyz.execute-api.us-east-1.amazonaws.com/dev
```

### 3. Finding Your API Gateway URL

After deploying your Lambda functions with API Gateway:

1. **AWS Console**: 
   - Go to API Gateway
   - Select your API
   - Click "Stages"
   - Copy the "Invoke URL"

2. **AWS CLI**:
   ```bash
   aws apigateway get-rest-apis
   ```

3. **Serverless Framework** (if using):
   ```bash
   serverless info
   ```
   Look for "endpoints" in the output

4. **SAM** (if using):
   ```bash
   sam deploy
   ```
   The URL will be in the outputs

## Lambda Function Endpoints

Your Lambda functions should expose these endpoints:

- **POST** `/usuario/crear` - User registration
- **POST** `/usuario/login` - User login

## CORS Configuration for Lambda

Make sure your Lambda functions return proper CORS headers:

```python
# Example for Python Lambda
def lambda_handler(event, context):
    # Your logic here
    
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': 'https://yourdomain.com',  # Or '*' for development
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'POST,GET,OPTIONS',
            'Access-Control-Allow-Credentials': 'true'
        },
        'body': json.dumps(response_data)
    }
```

```javascript
// Example for Node.js Lambda
exports.handler = async (event) => {
    // Your logic here
    
    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': 'https://yourdomain.com',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'POST,GET,OPTIONS',
            'Access-Control-Allow-Credentials': 'true'
        },
        body: JSON.stringify(responseData)
    };
};
```

## Environment Variables for Different Stages

### Development
```env
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### Staging
```env
# .env.staging
NEXT_PUBLIC_API_BASE_URL=https://abc123xyz.execute-api.us-east-1.amazonaws.com/staging
```

### Production
```env
# .env.production
NEXT_PUBLIC_API_BASE_URL=https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod
```

## Quick Update Instructions

When you get your Lambda URL, simply:

1. Open `.env.local`
2. Replace `http://localhost:8000` with your Lambda API Gateway URL
3. Restart the Next.js dev server:
   ```bash
   pnpm dev
   ```

That's it! No code changes needed. 🎉

## Testing with Lambda

Once configured:

1. **Restart the dev server** (environment variables are loaded at startup)
2. **Test registration**: http://localhost:3000/register
3. **Test login**: http://localhost:3000/login
4. **Check browser console** for any CORS or network errors

## Troubleshooting

### CORS Errors
- Ensure Lambda returns proper CORS headers
- Check API Gateway CORS settings
- Verify origin matches your frontend URL

### 404 Errors
- Verify endpoint paths match exactly (`/usuario/crear`, `/usuario/login`)
- Check API Gateway stage deployment
- Confirm Lambda function is deployed and active

### Authentication Errors
- Check Lambda CloudWatch logs
- Verify request body format matches Lambda expectations
- Test Lambda directly with Postman/curl first

## Custom Domain (Optional)

For a cleaner URL, set up a custom domain in API Gateway:

1. Register domain in Route 53
2. Create SSL certificate in ACM
3. Set up custom domain in API Gateway
4. Update `.env.production`:
   ```env
   NEXT_PUBLIC_API_BASE_URL=https://api.chinawok.com
   ```

---

**Note**: The API URL is completely flexible. Just update the environment variable whenever you have your Lambda endpoint ready! 🚀
