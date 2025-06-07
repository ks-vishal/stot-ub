#!/bin/bash

# Create necessary directories
mkdir -p iot/logs

# Initialize the database
echo "Initializing database..."
sqlite3 ../database/stot.db < ./scripts/init-db.sql

# Install dependencies
echo "Installing dependencies..."
npm install

# Start the server
echo "Starting server..."
npm run dev 