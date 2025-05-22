#!/bin/bash

# Navigate to the frontend directory
cd frontend

# Install dependencies
echo "Installing frontend dependencies..."
npm install

# Create a .env file for the frontend
echo "VITE_API_URL=http://localhost:8000" > .env

echo "Frontend setup complete!"
echo "To start the frontend development server, run: cd frontend && npm run dev"
echo "To start the backend server, run: cd backend && uvicorn main:app --reload"
echo "Or use the run.sh script to start both: ./run.sh"