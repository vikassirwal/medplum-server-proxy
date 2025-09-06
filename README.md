# EMR (Medplum Proxy) Server

A Node.js Express server that acts as a proxy for Medplum FHIR operations, providing OAuth2 authentication, FHIR resource access, and HL7 to FHIR conversion capabilities.

## Prerequisites

- Node.js 20.0.0 or higher
- npm 10.0.0 or higher
- Medplum account and OAuth2 credentials

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd medplum-server-proxy

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Medplum credentials
```

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3010
MEDPLUM_CLIENT_ID=your_client_id
MEDPLUM_CLIENT_SECRET=your_client_secret
MEDPLUM_REDIRECT_URI=http://localhost:3000/callback
OAUTH2_SERVER_URL=https://api.medplum.com (stays the same)
```

## Quick Start

```bash
# Development mode
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## API Documentation

### Base URL
```
http://localhost:3010
```

### Authentication

All FHIR endpoints require Bearer token authentication. Obtain a token using the OAuth2 flow described below.

---

## Endpoints

### 1. OAuth2 Authentication

#### Initiate Authorization
**GET** `/auth/authorize`

Initiates the OAuth2 authorization flow with Medplum.

**Request:**
```http
GET /auth/authorize
```

**Response:**
```json
{
  "success": true,
  "message": "OK",
  "redirectUrl": "https://your-medplum-instance.com/oauth2/authorize?response_type=code&client_id=your_client_id&redirect_uri=http://localhost:3000/callback&scope=openid",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Failed to connect to OAuth2 server: Network error",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

#### Exchange Code for Token
**POST** `/auth/getToken`

Exchanges an authorization code for an access token.

**Request:**
```http
POST /auth/getToken
Content-Type: application/json

{
  "code": "authorization_code_from_callback"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OAuth authorization completed successfully",
  "authorizationCode": "authorization_code_from_callback",
  "tokenData": {
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "refresh_token": "refresh_token_here"
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Missing Authorization Code",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

### 2. FHIR Resources

#### Get FHIR Resource
**GET** `/fhir/{version}/{resourceType}`

Retrieves a collection of FHIR resources.

**GET** `/fhir/{version}/{resourceType}/{id}`

Retrieves a specific FHIR resource by ID.

**Request:**
```http
GET /fhir/R4/Patient
Authorization: Bearer your_access_token
```

**Query Parameters:**
- `name` (string): Filter by patient name
- `gender` (string): Filter by gender
- `_count` (number): Number of results to return

**Response:**
```json
{
  "success": true,
  "data": {
    "resourceType": "Bundle",
    "type": "searchset",
    "total": 1,
    "entry": [
      {
        "resource": {
          "resourceType": "Patient",
          "id": "123",
          "name": [
            {
              "family": "Doe",
              "given": ["John"]
            }
          ],
          "gender": "male",
          "birthDate": "1990-01-01"
        }
      }
    ]
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Missing Authorization. Bearer token is required in Authorization header",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

#### Restricted Methods
**POST** `/fhir/{version}/{resourceType}`
**PUT** `/fhir/{version}/{resourceType}/{id}`
**PATCH** `/fhir/{version}/{resourceType}/{id}`
**DELETE** `/fhir/{version}/{resourceType}/{id}`

These methods are not supported and will return a 405 Method Not Allowed error.

**Response:**
```json
{
  "success": false,
  "message": "POST requests to FHIR resources are not supported. This endpoint only supports GET requests for read-only access to FHIR resources.",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

### 3. HL7 to FHIR Conversion

#### Convert HL7 to FHIR
**POST** `/convert/hl7-to-fhir`

Converts HL7 v2 messages to FHIR resources and stores them in Medplum.

**Request:**
```http
POST /convert/hl7-to-fhir
Authorization: Bearer your_access_token
Content-Type: application/json

{
  "message": "MSH|^~\\&|SendingApp|SendingFacility|ReceivingApp|ReceivingFacility|20240101120000||ADT^A01|123456|P|2.5\r\nPID|1||123456||Doe^John||19900101|M|||123 Main St^^City^ST^12345||555-1234",
  "resourceType": "Patient"
}
```

**Request Body:**
- `message` (string): HL7 v2 message to convert
- `resourceType` (string): Comma-separated list of FHIR resource types to create (e.g., "Patient,Coverage,ServiceRequest")

**Response:**
```json
{
  "success": true,
  "message": "FHIR insertion requested - see results below",
  "conversionResults": [
    {
      "resourceType": "Patient",
      "success": true,
      "data": {
        "resourceType": "Patient",
        "id": "123456",
        "name": [
          {
            "family": "Doe",
            "given": ["John"]
          }
        ],
        "gender": "male",
        "birthDate": "1990-01-01"
      },
      "status": 201
    }
  ],
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Missing Authorization. Authorization is required in the request headers.",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Validation Error Response:**
```json
{
  "success": false,
  "message": "Failed to process HL7 v2 message.",
  "error": [
    {
      "field": "MSH",
      "message": "First segment must be MSH"
    }
  ],
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

## Supported FHIR Resource Types

The conversion endpoint supports the following FHIR R4 resource types:

- **Patient** - Patient demographics and information
- **Coverage** - Insurance coverage information  
- **ServiceRequest** - Medical service requests and orders

## HL7 v2 Message Format

The server expects HL7 v2 messages with the following structure:

### Required Segments
- **MSH** - Message Header (required)
- **PID** - Patient Identification (for Patient resources)
- **IN1** - Insurance (for Coverage resources)
- **OBR/ORC** - Observation Request/Order Control (for ServiceRequest resources)

### Example HL7 Message
```
MSH|^~\\&|SendingApp|SendingFacility|ReceivingApp|ReceivingFacility|20240101120000||ADT^A01|123456|P|2.5
PID|1||123456||Doe^John||19900101|M|||123 Main St^^City^ST^12345||555-1234
IN1|1|12345^MR|Insurance Company^L|Group Name|||||123456789||||20200101|20251231||John^Doe^01|123456|01|Self|123 Main St^^City^ST^12345||555-1234|20240101
OBR|1|12345^MR|45678^LAB|CBC^Complete Blood Count^L|||20240101120000|||||||||DOC123^Smith^Jane|||||20240101120000
```