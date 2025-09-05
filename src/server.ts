import express, { Express } from 'express';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import controllers
import { initiateAuthorization } from './controllers/authController';
import { getFhirResource } from './controllers/fhirController';
import { handleCallback } from './controllers/callbackController';
import { convertHl7ToFhir } from './controllers/conversionController';

const app: Express = express();
const PORT: number = parseInt(process.env.PORT || '3010', 10);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Authorization initiation endpoint
app.get('/auth/authorize', initiateAuthorization);

// FHIR resources endpoint
app.get('/fhir/:resourceType/:id?', getFhirResource);

// Callback endpoint for other servers
app.get('/callback', handleCallback);

// HL7 v2 to FHIR conversion endpoint
app.post('/convert/hl7-to-fhir', convertHl7ToFhir);

// Start server
app.listen(PORT, (): void => {
  console.log(`🚀 Medplum Proxy Server is running on port ${PORT}`);
  console.log(`📍 Visit: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', (): void => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', (): void => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

export default app;
