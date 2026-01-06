#!/bin/bash

# PRPFIY Backend Startup Script

echo "🚀 Starting PRPFIY Backend..."

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found. Please install Python 3.10+"
    exit 1
fi

# Check if Ollama is running
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "⚠️  Ollama is not running. Starting Ollama..."
    ollama serve &
    sleep 3
fi

# Check if llama3 model exists
if ! ollama list | grep -q "llama3"; then
    echo "📥 Pulling llama3 model..."
    ollama pull llama3
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "📚 Installing dependencies..."
pip install -r requirements.txt -q

# Run the server
echo "✅ Starting FastAPI server on http://localhost:8000"
python main.py
