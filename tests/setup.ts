// Test setup
process.env.NODE_ENV = 'test';
process.env.PORT = '3010';
process.env.MEDPLUM_CLIENT_ID = 'test-client-id';
process.env.MEDPLUM_CLIENT_SECRET = 'test-client-secret';
process.env.MEDPLUM_REDIRECT_URI = 'http://localhost:3000/callback';
process.env.OAUTH2_SERVER_URL = 'https://test.medplum.com';