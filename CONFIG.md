# Configuration Guide

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3010

# Medplum OAuth2 Configuration
MEDPLUM_CLIENT_ID=your_client_id_here
MEDPLUM_CLIENT_SECRET=your_client_secret_here
MEDPLUM_REDIRECT_URI=http://localhost:3000/callback
OAUTH2_SERVER_URL=https://your-medplum-instance.com

# Optional: Set to 'production' for production environment
NODE_ENV=development
```

## Getting Medplum Credentials

1. Sign up for a Medplum account at https://app.medplum.com
2. Create a new OAuth2 application in your Medplum dashboard
3. Set the redirect URI to `http://localhost:3000/callback`
4. Copy the Client ID and Client Secret to your `.env` file
5. Use your Medplum instance URL for `OAUTH2_SERVER_URL`

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy the environment variables above to a `.env` file
4. Update the values with your Medplum credentials
5. Start the development server: `npm run dev`

## Production Setup

1. Set `NODE_ENV=production` in your environment
2. Use a secure port (e.g., 80, 443, or 8080)
3. Ensure all environment variables are properly set
4. Use HTTPS for production deployments
5. Consider implementing rate limiting and CORS policies
