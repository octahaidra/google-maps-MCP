#!/bin/bash

# Exit on error
set -e

# Set container name
CONTAINER_NAME="mcp-google-maps-server"

# Function to clean up
# cleanup() {
#     if [ ! -z "$CONTAINER_ID" ]; then
#         echo "Cleaning up..."
#         docker stop $CONTAINER_ID 2>/dev/null || true
#         docker rm $CONTAINER_ID 2>/dev/null || true
#     fi
# }

# # Set up trap for cleanup
# trap cleanup EXIT

# # Build the Docker image
# echo "Building Docker image..."
# docker build -t mcp-google-maps-server . || {
#     echo "Failed to build Docker image"
#     exit 1
# }

# # Run the container
# echo "Starting container..."
# docker run -d --name $CONTAINER_NAME --env-file .env mcp-google-maps-server

# # Wait for container to start
# echo "Waiting for container to start..."
# sleep 10

# Check if container is running
if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    echo "Container is running, executing tests..."
    docker exec $CONTAINER_NAME node test-server.js || {
        echo "Tests failed"
        docker logs $CONTAINER_NAME
        exit 1
    }
else
    echo "Container failed to start"
    docker logs $CONTAINER_NAME
    exit 1
fi

echo "Cleaning up..."
docker stop $CONTAINER_NAME
docker rm $CONTAINER_NAME

echo "Test completed successfully" 