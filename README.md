# Medplum Proxy Server

A simple Express.js server designed to serve as a proxy for Medplum functionality. Currently includes a basic "Hello World" endpoint and is fully containerized with Docker.

## Features

- 🚀 Express.js server with REST API
- 🐳 Docker containerization
- 💚 Health check endpoint
- 🔒 Security best practices (non-root user in container)
- 📊 Structured JSON responses
- 🛡️ Graceful shutdown handling

## Prerequisites

- Node.js 18+ (if running locally)
- Docker (for containerization)

## Quick Start

### Option 1: Run with Docker (Recommended)

1. **Build the Docker image:**
   ```bash
   docker build -t medplum-proxy-server .
   ```

2. **Run the container:**
   ```bash
   docker run -p 3000:3000 medplum-proxy-server
   ```

3. **Visit the application:**
   - Main endpoint: http://localhost:3000
   - Health check: http://localhost:3000/health

### Option 2: Run Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   # Production mode
   npm start
   
   # Development mode (with auto-restart)
   npm run dev
   ```

3. **Visit the application:**
   - Main endpoint: http://localhost:3000
   - Health check: http://localhost:3000/health

## Available Endpoints

### GET `/`
Returns a welcome message with server information.

**Response:**
```json
{
  "message": "Hello World!",
  "service": "Medplum Proxy Server",
  "version": "1.0.0",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### GET `/health`
Health check endpoint for monitoring and load balancers.

**Response:**
```json
{
  "status": "healthy",
  "uptime": 123.456,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Docker Commands

### Build and Run
```bash
# Build the image
npm run docker:build

# Run the container
npm run docker:run
```

### Manual Docker Commands
```bash
# Build
docker build -t medplum-proxy-server .

# Run with port mapping
docker run -p 3000:3000 medplum-proxy-server

# Run in detached mode
docker run -d -p 3000:3000 --name medplum-proxy medplum-proxy-server

# View logs
docker logs medplum-proxy

# Stop container
docker stop medplum-proxy

# Remove container
docker rm medplum-proxy
```

## Environment Variables

- `PORT`: Server port (default: 3000)

Example:
```bash
# Local development
PORT=8080 npm start

# Docker
docker run -p 8080:8080 -e PORT=8080 medplum-proxy-server
```

## Project Structure

```
medplum-proxy-server/
├── server.js          # Main Express application
├── package.json       # Node.js dependencies and scripts
├── Dockerfile         # Docker container configuration
├── .dockerignore      # Files to exclude from Docker build
└── README.md          # This file
```

## Development

### Adding New Endpoints

1. Edit `server.js`
2. Add your new route:
   ```javascript
   app.get('/your-endpoint', (req, res) => {
     res.json({ message: 'Your response' });
   });
   ```
3. Restart the server

### Docker Development

For development with Docker, you can mount the source code:
```bash
docker run -p 3000:3000 -v $(pwd):/app medplum-proxy-server npm run dev
```

## Production Considerations

- The Docker image uses Node.js Alpine for smaller size
- Runs as non-root user for security
- Includes health checks for container orchestration
- Graceful shutdown handling for clean restarts

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally and with Docker
5. Submit a pull request

## License

ISC
