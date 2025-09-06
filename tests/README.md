# Tests

This directory contains unit tests for the Medplum Proxy Server.

## Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Test Structure

- `controllers/` - Tests for API controllers
- `services/` - Tests for business logic services  
- `mapper/` - Tests for HL7 to FHIR data mappers
- `server.test.ts` - Integration tests for API endpoints

## Test Coverage

The tests cover:
- Authentication flow
- FHIR resource operations
- HL7 message validation
- Data conversion between HL7 and FHIR formats
- Error handling scenarios