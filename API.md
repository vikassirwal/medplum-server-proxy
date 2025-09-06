# API Reference

This document provides detailed API reference for the Medplum Proxy Server.

## Base URL
```
http://localhost:3010
```

## Authentication

The API uses Bearer token authentication for FHIR endpoints. Tokens are obtained through the OAuth2 flow.

### Getting an Access Token

1. Call `GET /auth/authorize` to get the authorization URL
2. Redirect user to the returned URL
3. User completes OAuth2 flow
4. Call `POST /auth/getToken` with the authorization code
5. Use the returned `access_token` in subsequent requests

---

## Endpoints

### Authentication Endpoints

#### GET /auth/authorize

Initiates OAuth2 authorization flow.

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

**Status Codes:**
- `200` - Success
- `502` - OAuth2 server error

---

#### POST /auth/getToken

Exchanges authorization code for access token.

**Request:**
```http
POST /auth/getToken
Content-Type: application/json

{
  "code": "authorization_code_from_callback"
}
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| code | string | Yes | Authorization code from OAuth2 callback |

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
    "refresh_token": "refresh_token_here",
    "scope": "openid"
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Error Responses:**
```json
{
  "success": false,
  "error": "Missing Authorization Code",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Status Codes:**
- `200` - Success
- `400` - Missing authorization code
- `500` - Token exchange failed

---

### FHIR Endpoints

#### GET /fhir/{version}/{resourceType}

Retrieves a collection of FHIR resources.

**Request:**
```http
GET /fhir/R4/Patient
Authorization: Bearer your_access_token
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| version | string | Yes | FHIR version (e.g., "R4") |
| resourceType | string | Yes | FHIR resource type (e.g., "Patient") |

**Query Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| name | string | Filter by patient name | `name=John` |
| birthdate | string | Filter by birth date | `birthdate=1990-01-01` |
| gender | string | Filter by gender | `gender=male` |
| _count | number | Number of results | `_count=10` |
| _offset | number | Skip results | `_offset=20` |

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

**Error Responses:**
```json
{
  "success": false,
  "error": "Missing Authorization. Bearer token is required in Authorization header",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Status Codes:**
- `200` - Success
- `401` - Missing or invalid authorization
- `404` - Resource not found
- `500` - Server error

---

#### GET /fhir/{version}/{resourceType}/{id}

Retrieves a specific FHIR resource by ID.

**Request:**
```http
GET /fhir/R4/Patient/123
Authorization: Bearer your_access_token
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| version | string | Yes | FHIR version (e.g., "R4") |
| resourceType | string | Yes | FHIR resource type (e.g., "Patient") |
| id | string | Yes | Resource ID |

**Response:**
```json
{
  "success": true,
  "data": {
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
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Status Codes:**
- `200` - Success
- `401` - Missing or invalid authorization
- `404` - Resource not found
- `500` - Server error

---

#### POST /fhir/{version}/{resourceType}
#### PUT /fhir/{version}/{resourceType}/{id}
#### PATCH /fhir/{version}/{resourceType}/{id}
#### DELETE /fhir/{version}/{resourceType}/{id}

These methods are not supported and return a 405 Method Not Allowed error.

**Response:**
```json
{
  "success": false,
  "message": "POST requests to FHIR resources are not supported. This endpoint only supports GET requests for read-only access to FHIR resources.",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Status Codes:**
- `405` - Method Not Allowed

---

### Conversion Endpoints

#### POST /convert/hl7-to-fhir

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
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| message | string | Yes | HL7 v2 message to convert |
| resourceType | string | Yes | Comma-separated list of FHIR resource types |

**Supported Resource Types:**
- `Patient` - Patient demographics
- `Coverage` - Insurance coverage
- `ServiceRequest` - Medical service requests

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

**Error Responses:**
```json
{
  "success": false,
  "error": "Missing Authorization. Authorization is required in the request headers.",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

```json
{
  "success": false,
  "error": "Missing Message or Resource Type. Message and Resource Type are required in the request body.",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

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

**Status Codes:**
- `200` - Success
- `400` - Invalid request or HL7 validation error
- `401` - Missing authorization
- `500` - Server error

---

## HL7 v2 Message Format

### Required Segments

#### MSH (Message Header)
```
MSH|^~\\&|SendingApp|SendingFacility|ReceivingApp|ReceivingFacility|20240101120000||ADT^A01|123456|P|2.5
```

#### PID (Patient Identification) - for Patient resources
```
PID|1||123456||Doe^John||19900101|M|||123 Main St^^City^ST^12345||555-1234
```

#### IN1 (Insurance) - for Coverage resources
```
IN1|1|12345^MR|Insurance Company^L|Group Name|||||123456789||||20200101|20251231||John^Doe^01|123456|01|Self|123 Main St^^City^ST^12345||555-1234|20240101
```

#### OBR (Observation Request) - for ServiceRequest resources
```
OBR|1|12345^MR|45678^LAB|CBC^Complete Blood Count^L|||20240101120000|||||||||DOC123^Smith^Jane|||||20240101120000
```

### Field Mappings

#### Patient Resource
| HL7 Field | FHIR Field | Description |
|-----------|------------|-------------|
| PID.3 | Patient.id | Patient identifier |
| PID.5 | Patient.name | Patient name |
| PID.7 | Patient.birthDate | Birth date |
| PID.8 | Patient.gender | Gender |
| PID.11 | Patient.address | Address |
| PID.13 | Patient.telecom | Phone number |

#### Coverage Resource
| HL7 Field | FHIR Field | Description |
|-----------|------------|-------------|
| IN1.2 | Coverage.id | Coverage identifier |
| IN1.3 | Coverage.payor | Insurance company |
| IN1.8 | Coverage.class | Group number |
| IN1.12 | Coverage.period.start | Coverage start date |
| IN1.13 | Coverage.period.end | Coverage end date |
| IN1.16 | Coverage.subscriber | Subscriber information |

#### ServiceRequest Resource
| HL7 Field | FHIR Field | Description |
|-----------|------------|-------------|
| OBR.2 | ServiceRequest.id | Service request identifier |
| OBR.4 | ServiceRequest.code | Service code |
| OBR.5 | ServiceRequest.status | Request status |
| OBR.12 | ServiceRequest.requester | Ordering provider |

---

## Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "error": "Error description",
  "message": "Additional error details (optional)",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing or invalid token |
| 404 | Not Found - Resource not found |
| 405 | Method Not Allowed - Unsupported HTTP method |
| 500 | Internal Server Error |
| 502 | Bad Gateway - External service error |

### Common Error Scenarios

#### Missing Authorization
```json
{
  "success": false,
  "error": "Missing Authorization. Bearer token is required in Authorization header",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

#### Invalid HL7 Message
```json
{
  "success": false,
  "message": "Failed to process HL7 v2 message.",
  "error": [
    {
      "field": "MSH",
      "message": "First segment must be MSH"
    },
    {
      "field": "MSH.1",
      "message": "Invalid encoding characters: ^~\\&, expected ^~\\&"
    }
  ],
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

#### FHIR Service Error
```json
{
  "success": false,
  "error": "Failed to retrieve FHIR resource",
  "message": "Resource not found",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting for production use.

## CORS

CORS is not explicitly configured. Add CORS middleware for cross-origin requests if needed.

## Security

- All FHIR endpoints require valid Bearer tokens
- OAuth2 flow uses secure HTTPS endpoints
- HL7 message validation prevents malformed input
- Read-only access to FHIR resources
- Environment variables for sensitive configuration

## Examples

### Complete OAuth2 Flow

```bash
# 1. Get authorization URL
curl -X GET http://localhost:3010/auth/authorize

# 2. User completes OAuth2 flow in browser
# 3. Exchange code for token
curl -X POST http://localhost:3010/auth/getToken \
  -H "Content-Type: application/json" \
  -d '{"code": "authorization_code_from_callback"}'

# 4. Use token for FHIR requests
curl -X GET http://localhost:3010/fhir/R4/Patient \
  -H "Authorization: Bearer your_access_token"
```

### HL7 to FHIR Conversion

```bash
curl -X POST http://localhost:3010/convert/hl7-to-fhir \
  -H "Authorization: Bearer your_access_token" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "MSH|^~\\&|SendingApp|SendingFacility|ReceivingApp|ReceivingFacility|20240101120000||ADT^A01|123456|P|2.5\r\nPID|1||123456||Doe^John||19900101|M|||123 Main St^^City^ST^12345||555-1234",
    "resourceType": "Patient"
  }'
```
