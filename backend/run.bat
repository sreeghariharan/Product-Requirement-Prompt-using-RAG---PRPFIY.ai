@echo off
REM PRPFIY Backend Startup Script for Windows

echo 🚀 Starting PRPFIY Backend...

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found. Please install Python 3.10+
    exit /b 1
)

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo 📚 Installing dependencies...
pip install -r requirements.txt -q

REM Check if Ollama is running
curl -s http://localhost:11434/api/tags >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Ollama is not running. Please start Ollama first:
    echo    ollama serve
    echo.
    echo Then run this script again.
    exit /b 1
)

REM Run the server
echo ✅ Starting FastAPI server on http://localhost:8000
python main.py
