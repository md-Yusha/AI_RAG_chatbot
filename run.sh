#!/bin/bash

# Start the backend
echo "Starting the backend server..."
cd backend
uvicorn main:app --reload &
BACKEND_PID=$!

# Start the frontend
echo "Starting the frontend development server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Function to handle script termination
function cleanup {
  echo "Shutting down servers..."
  kill $BACKEND_PID
  kill $FRONTEND_PID
  exit
}

# Trap SIGINT (Ctrl+C) and call cleanup
trap cleanup SIGINT

# Keep the script running
echo "Both servers are running. Press Ctrl+C to stop."
wait