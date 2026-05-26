# PRPFIY - How to Run the Project

## Prerequisites

1. **Node.js** (v18+) - [Download](https://nodejs.org/)
2. **Python** (3.10+) - [Download](https://python.org/)
3. **Groq API Key** - [Get free key](https://console.groq.com/)

---

## Quick Start (2 Terminals in VS Code)

### Terminal 1: Start Backend
```bash
# Navigate to backend folder
cd backend

# Create virtual environment (first time only)
python -m venv .venv

# Activate virtual environment
.\.venv\Scripts\activate   # Windows
# source .venv/bin/activate  # Mac/Linux

# Install dependencies (first time only)
pip install -r requirements.txt

# Set your Groq API key in backend/.env
# Edit backend/.env and replace "your_groq_api_key_here" with your actual key

# Start backend server
python main.py
```
**Expected output:** `INFO: Uvicorn running on http://0.0.0.0:8000`

### Terminal 2: Start Frontend
```bash
# Navigate to frontend folder
cd frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```
**Expected output:** `VITE ready at http://localhost:8080`

---

## Open the App
Navigate to: **http://localhost:8080**

### First Time Setup
1. Click the ⚙️ **Settings** icon in the sidebar
2. Enter your **Groq API Key** (get it free at [console.groq.com](https://console.groq.com))
3. Save — you're ready to chat!

---

## How to Use

### Normal Chat Mode
Just type any message and press Enter — PRPFIY responds conversationally like ChatGPT.

### PRP Generation Mode
1. Click the ✨ **"Generate PRP"** button in the toolbar
2. A framework selector appears (default: RTCFR)
3. Type your product requirements and press Enter
4. Get a structured Product Requirement Prompt!

### Document Upload (RAG)
Click the 📎 paperclip icon to upload PDF, DOCX, TXT, or MD files. The AI will use them as context.

---

## Common Errors & Solutions

### 1. Blank Screen / App Not Loading
**Solution:** Open browser console (F12) and run:
```javascript
localStorage.clear(); 
location.reload();
```

### 2. "net::ERR_CONNECTION_REFUSED" on chat
**Solution:** Check Terminal 1 — backend should show "Uvicorn running". Restart with `python main.py`.

### 3. "Groq API key not configured"
**Solution:** 
- Open Settings (⚙️ in sidebar) and enter your API key, OR
- Edit `backend/.env` and set `GROQ_API_KEY=gsk_your_key_here`

### 4. Port Already in Use
**Solution:**
```bash
npx kill-port 8000   # Backend
npx kill-port 8080   # Frontend
```

### 5. Python venv not found
**Solution:**
```bash
python -m venv .venv
.\.venv\Scripts\activate
pip install -r backend/requirements.txt
```

---

## Service URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:8080 | Web UI |
| Backend API | http://localhost:8000 | FastAPI server |

---

## Stopping the Project

Press `Ctrl+C` in each terminal, or force stop:
```bash
taskkill /F /IM node.exe; taskkill /F /IM python.exe
```
