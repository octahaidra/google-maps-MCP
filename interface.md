# Google Maps MCP Server API Documentation

This document describes how to interact with the Google Maps MCP Server API. The server supports both HTTP and WebSocket connections for various Google Maps services.

## Connection Details

- **HTTP Base URL**: `http://localhost:3000/trpc`
- **WebSocket Base URL**: `ws://localhost:3000/trpc`
- **Content-Type**: `application/json`

## Common Request Format

All HTTP requests follow this JSON-RPC 2.0 format:

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "mutation",
  "params": {
    "input": {
      // endpoint-specific parameters
    }
  }
}
```

## Available Endpoints

### Health Check

Check if the server is running.

```http
GET /health
```

**Response**:
```json
{
  "status": "ok"
}
```

### Geocoding

Convert an address to coordinates.

#### HTTP Request (Mutation)
```http
POST /trpc/geocode
```

**Request Body**:
```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "mutation",
  "params": {
    "input": {
      "address": "1600 Amphitheatre Parkway, Mountain View, CA"
    }
  }
}
```

**Response**:
```json
{
  "result": {
    "data": {
      "content": [{
        "type": "text",
        "text": {
          "location": {
            "lat": 37.4220097,
            "lng": -122.0847516
          },
          "formatted_address": "1600 Amphitheatre Pkwy, Mountain View, CA 94043, USA",
          "place_id": "ChIJF4Yf2Ry7j4AR__1AkytDyAE"
        }
      }],
      "isError": false
    }
  }
}
```

#### WebSocket Request (Streaming)
```json
{
  "id": 1,
  "method": "subscription",
  "params": {
    "path": "geocodeStream",
    "input": {
      "address": "1600 Amphitheatre Parkway, Mountain View, CA"
    }
  }
}
```

### Place Search

Search for places using a text query.

#### HTTP Request (Mutation)
```http
POST /trpc/searchPlaces
```

**Request Body**:
```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "mutation",
  "params": {
    "input": {
      "query": "restaurants in San Francisco",
      "location": {
        "latitude": 37.7749,
        "longitude": -122.4194
      },
      "radius": 5000
    }
  }
}
```

**Note**: `location` and `radius` are optional parameters.

**Response**:
```json
{
  "result": {
    "data": {
      "content": [{
        "type": "text",
        "text": {
          "places": [{
            "name": "Restaurant Name",
            "formatted_address": "123 Example St, San Francisco, CA",
            "location": {
              "lat": 37.7749,
              "lng": -122.4194
            },
            "place_id": "place_id_here",
            "rating": 4.5,
            "types": ["restaurant", "food"]
          }]
        }
      }],
      "isError": false
    }
  }
}
```

### Place Details

Get detailed information about a specific place.

```http
POST /trpc/placeDetails
```

**Request Body**:
```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "mutation",
  "params": {
    "input": {
      "place_id": "ChIJF4Yf2Ry7j4AR__1AkytDyAE"
    }
  }
}
```

### Distance Matrix

Calculate distances between origins and destinations.

```http
POST /trpc/distanceMatrix
```

**Request Body**:
```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "mutation",
  "params": {
    "input": {
      "origins": ["San Francisco, CA"],
      "destinations": ["Mountain View, CA"],
      "mode": "driving"
    }
  }
}
```

**Note**: `mode` is optional and can be one of: `"driving"`, `"walking"`, `"bicycling"`, `"transit"`

### Elevation

Get elevation data for specific locations.

```http
POST /trpc/elevation
```

**Request Body**:
```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "mutation",
  "params": {
    "input": {
      "locations": [{
        "latitude": 37.7749,
        "longitude": -122.4194
      }]
    }
  }
}
```

### Directions

Get directions between two locations.

```http
POST /trpc/directions
```

**Request Body**:
```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "mutation",
  "params": {
    "input": {
      "origin": "San Francisco, CA",
      "destination": "Mountain View, CA",
      "mode": "driving"
    }
  }
}
```

**Note**: `mode` is optional and can be one of: `"driving"`, `"walking"`, `"bicycling"`, `"transit"`

## Error Handling

When an error occurs, the response will follow this format:

```json
{
  "error": {
    "message": "Error description",
    "code": -32004,
    "data": {
      "code": "ERROR_CODE",
      "httpStatus": 404,
      "path": "endpoint_path"
    }
  }
}
```

## WebSocket Streaming

For endpoints that support streaming (those with `Stream` suffix), the WebSocket connection will receive multiple messages:
1. An initial "Loading..." message with `isPartial: true`
2. The final result with complete data
3. A completion message

Example WebSocket message sequence:
```json
// Message 1 (Loading)
{
  "result": {
    "data": {
      "content": [{"type": "text", "text": "Loading..."}],
      "isError": false,
      "isPartial": true
    }
  }
}

// Message 2 (Final Result)
{
  "result": {
    "data": {
      "content": [{"type": "text", "text": "...actual data..."}],
      "isError": false
    }
  }
}
```
