# PRPFIY Backend

Local Python backend using Ollama Llama3 with LangChain for AIR (Align-Improve-Refine) optimized PRP generation.

## Prerequisites

1. **Python 3.10+** installed
2. **Ollama** installed and running

## Setup Instructions

### 1. Install Ollama

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows
# Download from https://ollama.com/download
```

### 2. Pull Llama3 Model

```bash
ollama pull llama3
```

### 3. Start Ollama Server

```bash
ollama serve
```

This will start the Ollama server on `http://localhost:11434`

### 4. Setup Python Environment

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate
# Windows:
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 5. Run the Backend

```bash
python main.py
```

Or using uvicorn directly:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at `http://localhost:8000`

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/health` | GET | Ollama connection status |
| `/upload` | POST | Upload document for RAG |
| `/chat` | POST | Generate PRP with AIR method |
| `/knowledge-base/{space_id}` | DELETE | Clear knowledge base |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     PRPFIY Frontend                     │
│                   (React + TypeScript)                  │
└─────────────────────────┬───────────────────────────────┘
                          │ HTTP
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    FastAPI Backend                      │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │   Upload    │  │    Chat     │  │   Knowledge     │ │
│  │   Handler   │  │   Handler   │  │     Base        │ │
│  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘ │
│         │                │                   │          │
│         ▼                ▼                   ▼          │
│  ┌─────────────────────────────────────────────────────┐│
│  │                   LangChain                         ││
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────┐  ││
│  │  │   AIR      │  │  Framework │  │    RAG       │  ││
│  │  │  Method    │  │   Prompts  │  │  Retrieval   │  ││
│  │  └────────────┘  └────────────┘  └──────────────┘  ││
│  └─────────────────────────┬───────────────────────────┘│
│                            │                            │
└────────────────────────────┼────────────────────────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
           ▼                 ▼                 ▼
    ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
    │   Ollama    │   │  ChromaDB   │   │ HuggingFace │
    │   Llama3    │   │   Vector    │   │  Embeddings │
    │             │   │    Store    │   │             │
    └─────────────┘   └─────────────┘   └─────────────┘
```

## AIR Method

The backend implements the AIR (Align-Improve-Refine) method:

1. **Align**: Generate initial response using the selected framework prompt
2. **Improve**: Self-critique and enhance the response for specificity
3. **Refine**: Final polish for professional formatting

## Supported Frameworks

- RTCFR (Role-Task-Context-Format-Requirements)
- RTF (Role-Task-Format)
- CRISPE (Capacity-Request-Insight-Statement-Personality-Experiment)
- COSTAR (Context-Objective-Style-Tone-Audience-Response)
- TASK-SPEC (Task-Action-Style-Knowledge-Special-Persona-Examples-Constraints)
- A-I-C (Actor-Instruction-Context)
- SPAR (Situation-Problem-Action-Result)
- CoT (Chain of Thought)
- ReAct (Reasoning + Acting)

## Troubleshooting

### Ollama not responding
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Restart Ollama
ollama serve
```

### Model not found
```bash
# Pull the model again
ollama pull llama3

# List available models
ollama list
```

### ChromaDB issues
```bash
# Clear the database
rm -rf ./chroma_db
```
