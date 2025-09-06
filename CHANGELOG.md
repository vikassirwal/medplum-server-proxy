# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2024-01-01

### Added
- OAuth2 authentication flow with Medplum
- FHIR R4 resource access (read-only)
- HL7 v2 to FHIR conversion for Patient, Coverage, and ServiceRequest resources
- Comprehensive error handling and validation
- Full test coverage with Jest
- Docker support
- TypeScript support with strict type checking
- ESLint configuration for code quality

### Features
- **Authentication**: Complete OAuth2 flow with authorization code exchange
- **FHIR Access**: Read-only access to FHIR resources with query parameter support
- **HL7 Conversion**: Convert HL7 v2 messages to FHIR R4 resources
- **Validation**: HL7 message format validation with detailed error reporting
- **Security**: Bearer token authentication and input validation
- **Testing**: 85%+ test coverage with unit and integration tests

### API Endpoints
- `GET /auth/authorize` - Initiate OAuth2 flow
- `POST /auth/getToken` - Exchange code for token
- `GET /fhir/{version}/{resourceType}` - Get FHIR resource collection
- `GET /fhir/{version}/{resourceType}/{id}` - Get specific FHIR resource
- `POST /convert/hl7-to-fhir` - Convert HL7 to FHIR

### Supported FHIR Resources
- Patient demographics and information
- Insurance coverage information
- Medical service requests and orders

### Technical Details
- Node.js 20+ and npm 10+ required
- Express.js web framework
- TypeScript for type safety
- Axios for HTTP requests
- Jest for testing
- Docker for containerization
