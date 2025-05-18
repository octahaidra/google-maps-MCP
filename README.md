# Google Maps MCP Server

A Model Context Protocol (MCP) server implementation for Google Maps APIs, providing geocoding, place search, directions, and other mapping functionalities.

## Prerequisites

- Node.js 18 or higher
- Docker (for containerized deployment)
- Google Maps API key with the following APIs enabled:
  - Geocoding API
  - Places API
  - Distance Matrix API
  - Elevation API
  - Directions API

## Environment Setup

1. Create a `.env` file in the project root:
```bash
GOOGLE_MAPS_API_KEY=your_api_key_here
```

2. Install dependencies:
```bash
npm install
```

## Development

### Running the Server Locally

1. Build the TypeScript files:
```bash
npm run build
```

2. Start the server:
```bash
node dist/server.js
```

### Testing

#### Running Tests Locally

1. Make sure the server is built:
```bash
npm run build
```

2. Run the test script:
```bash
node test-server.js
```

The test script will:
- Start the server
- Run test cases for geocoding, reverse geocoding, and place search
- Verify responses
- Clean up by stopping the server

#### Running Tests with Docker

1. Make the test script executable:
```bash
chmod +x test-docker.sh
```

2. Run the Docker test script:
```bash
./test-docker.sh
```

This will:
- Build the Docker image
- Start a container with your server
- Run the test script inside the container
- Clean up by stopping and removing the container

## Docker Deployment

### Building the Docker Image

```bash
docker build -t mcp-google-maps-server .
```

### Running the Docker Container

```bash
docker run -d --env-file .env mcp-google-maps-server
```

## API Endpoints

The server provides the following MCP endpoints:

### Geocoding
- **Endpoint**: `/trpc/geocode`
- **Method**: POST
- **Request Body**:
  ```json
  {
    "address": "1600 Amphitheatre Parkway, Mountain View, CA"
  }
  ```

### Reverse Geocoding
- **Endpoint**: `/trpc/reverse_geocode`
- **Method**: POST
- **Request Body**:
  ```json
  {
    "location": {
      "latitude": 49.26046,
      "longitude": 11.04339
    }
  }
  ```

### Place Search
- **Endpoint**: `/trpc/searchPlaces`
- **Method**: POST
- **Request Body**:
  ```json
  {
    "query": "restaurants in Nürnberg",
    "location": {
      "latitude": 49.26046,
      "longitude": 11.04339
    }
  }
  ```

### Place Details
- **Endpoint**: `/trpc/placeDetails`
- **Method**: POST
- **Request Body**:
  ```json
  {
    "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4"
  }
  ```

### Distance Matrix
- **Endpoint**: `/trpc/distanceMatrix`
- **Method**: POST
- **Request Body**:
  ```json
  {
    "origins": ["New York, NY"],
    "destinations": ["Boston, MA"],
    "mode": "driving"
  }
  ```

### Elevation
- **Endpoint**: `/trpc/elevation`
- **Method**: POST
- **Request Body**:
  ```json
  {
    "locations": [
      {
        "latitude": 49.26046,
        "longitude": 11.04339
      }
    ]
  }
  ```

### Directions
- **Endpoint**: `/trpc/directions`
- **Method**: POST
- **Request Body**:
  ```json
  {
    "origin": "New York, NY",
    "destination": "Boston, MA",
    "mode": "driving"
  }
  ```

## Error Handling

The server includes comprehensive error handling for:
- Invalid API keys
- API request failures
- Invalid input parameters
- Network issues

## Troubleshooting

### Docker Build Issues

If you encounter issues during the Docker build:

1. Make sure you have the latest version of Docker installed
2. Try clearing Docker's build cache:
```bash
docker builder prune
```

3. If npm install fails in the container:
   - Check your package.json for any dependency issues
   - Try running `npm install --legacy-peer-deps` locally first
   - Make sure all dependencies are compatible with Node.js 18

### Container Issues

If the container fails to start:

1. Check the container logs:
```bash
docker logs <container_id>
```

2. Verify your .env file:
   - Make sure it exists
   - Check that GOOGLE_MAPS_API_KEY is set correctly
   - Ensure there are no extra spaces or quotes

3. Test the container interactively:
```bash
docker run -it --env-file .env mcp-google-maps-server /bin/sh
```

### Test Failures

If tests are failing:

1. Check the test output for specific error messages
2. Verify that your Google Maps API key has all required APIs enabled
3. Try running the tests locally first:
```bash
npm run build
node test-server.js
```

4. Check the server logs for any API-related errors

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
