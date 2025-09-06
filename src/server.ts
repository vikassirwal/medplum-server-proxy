import express, { Express } from 'express';
import dotenv from 'dotenv';

dotenv.config();

import { initiateAuthorization } from './controllers/authController';
import { getFhirResource, handleRestrictedFhirMethod } from './controllers/fhirController';
import { getToken } from './controllers/exchangeCodeForToken';
import { convertHl7ToFhir } from './controllers/conversionController';

const app: Express = express();
const PORT: number = parseInt(process.env.PORT || '3010', 10);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/auth/authorize', initiateAuthorization);

app.get('/fhir/:version/:resourceType', getFhirResource);

app.get('/fhir/:version/:resourceType/:id', getFhirResource);

app.post('/fhir/:version/:resourceType', handleRestrictedFhirMethod);
app.put('/fhir/:version/:resourceType/:id', handleRestrictedFhirMethod);
app.patch('/fhir/:version/:resourceType/:id', handleRestrictedFhirMethod);
app.delete('/fhir/:version/:resourceType/:id', handleRestrictedFhirMethod);

app.post('/auth/getToken', getToken);

app.post('/convert/hl7-to-fhir', convertHl7ToFhir);


app.listen(PORT, (): void => {
  console.log(`Medplum Proxy Server is running on port ${PORT}`);
  console.log(`Visit: http://localhost:${PORT}`);
});

process.on('SIGTERM', (): void => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', (): void => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

export default app;
