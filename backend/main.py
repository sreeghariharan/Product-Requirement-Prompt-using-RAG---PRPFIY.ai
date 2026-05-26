"""
PRPFIY Backend - Groq API Integration
Dual-mode chat: Normal conversational AI + PRP generation using prompt frameworks
Uses LangChain with Groq for fast inference
"""

import os
import uuid
from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import chromadb
from langchain_groq import ChatGroq
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from dotenv import load_dotenv
import tempfile
import shutil

# Document processors
from pypdf import PdfReader
from docx import Document

# Load environment variables
load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
MODEL_NAME = "llama-3.3-70b-versatile"

app = FastAPI(title="PRPFIY Backend", version="2.0.0")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ChromaDB for vector storage (persistent)
db_path = os.path.join(os.path.dirname(__file__), "chroma_db")
chroma_client = chromadb.PersistentClient(path=db_path)

# Initialize embeddings (kept for RAG / document search)
embeddings = HuggingFaceEmbeddings(
    model_name="all-MiniLM-L6-v2",
    model_kwargs={'device': 'cpu'}
)

# Text splitter for documents
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    length_function=len,
)

# ─── System prompt for normal chat mode ──────────────────────────────────────

CHAT_SYSTEM_PROMPT = """You are PRPFIY, a helpful and knowledgeable AI assistant specializing in product management, software development, and requirements engineering.

You respond naturally and conversationally, like ChatGPT or Claude. You can help with:
- General questions about software development, product management, and technology
- Brainstorming ideas and providing advice
- Explaining concepts and best practices
- Reviewing and improving text
- Any other general assistance

If the user provides context from uploaded documents, use that context to inform your answers.

Keep your responses well-formatted with markdown when appropriate (headers, bold, lists, code blocks).

Context from Knowledge Base (if available):
{context}"""

# ─── Framework prompts for PRP mode ──────────────────────────────────────────

FRAMEWORK_PROMPTS = {
    "RTCFR": """You are a Product Manager creating a Product Requirement Prompt (PRP).
Use the RTCFR framework:
- **Role**: Define who you are in this context
- **Task**: What needs to be accomplished
- **Context**: Background information and constraints
- **Format**: How the output should be structured
- **Requirements**: Specific functional and non-functional requirements

User Request: {user_input}

Context from Knowledge Base:
{context}

Generate a comprehensive, detailed PRP using the RTCFR framework. Use proper markdown formatting with headers, bullet points, and sections.""",

    "RTF": """You are a Product Manager creating a Product Requirement Prompt (PRP).
Use the RTF framework:
- **Role**: Your role in this context
- **Task**: What needs to be done
- **Format**: Output structure

User Request: {user_input}

Context from Knowledge Base:
{context}

Generate a PRP using the RTF framework. Use proper markdown formatting.""",

    "CRISPE": """You are a Product Manager creating a Product Requirement Prompt (PRP).
Use the CRISPE framework:
- **Capacity**: Your role and capabilities
- **Request**: What is being asked
- **Insight**: Key insights and analysis
- **Statement**: Clear problem statement
- **Personality**: Communication style
- **Experiment**: Testing approach

User Request: {user_input}

Context from Knowledge Base:
{context}

Generate a PRP using the CRISPE framework. Use proper markdown formatting.""",

    "COSTAR": """You are a Product Manager creating a Product Requirement Prompt (PRP).
Use the COSTAR framework:
- **Context**: Background and situation
- **Objective**: Goals to achieve
- **Style**: Writing style
- **Tone**: Communication tone
- **Audience**: Target readers
- **Response**: Expected output format

User Request: {user_input}

Context from Knowledge Base:
{context}

Generate a PRP using the COSTAR framework. Use proper markdown formatting.""",

    "TASK-SPEC": """You are a Product Manager creating a Product Requirement Prompt (PRP).
Use the TASK-SPEC framework:
- **Task**: The main objective
- **Action**: Steps to accomplish
- **Style**: Presentation style
- **Knowledge**: Required knowledge
- **Special**: Special considerations
- **Persona**: User personas
- **Examples**: Reference examples
- **Constraints**: Limitations

User Request: {user_input}

Context from Knowledge Base:
{context}

Generate a PRP using the TASK-SPEC framework. Use proper markdown formatting.""",

    "A-I-C": """You are a Product Manager creating a Product Requirement Prompt (PRP).
Use the A-I-C framework:
- **Actor**: Who is involved
- **Instruction**: What to do
- **Context**: Relevant background

User Request: {user_input}

Context from Knowledge Base:
{context}

Generate a PRP using the A-I-C framework. Use proper markdown formatting.""",

    "SPAR": """You are a Product Manager creating a Product Requirement Prompt (PRP).
Use the SPAR framework:
- **Situation**: Current state
- **Problem**: Issues to address
- **Action**: Proposed solutions
- **Result**: Expected outcomes

User Request: {user_input}

Context from Knowledge Base:
{context}

Generate a PRP using the SPAR framework. Use proper markdown formatting.""",

    "CoT": """You are a Product Manager creating a Product Requirement Prompt (PRP).
Use Chain of Thought reasoning to break down the requirements step by step.

User Request: {user_input}

Context from Knowledge Base:
{context}

Think through this step by step and generate a comprehensive PRP. Use proper markdown formatting.""",

    "ReAct": """You are a Product Manager creating a Product Requirement Prompt (PRP).
Use the ReAct framework combining Reasoning and Acting:
1. **Thought**: Analyze the request
2. **Action**: Define what needs to be done
3. **Observation**: Review and refine

User Request: {user_input}

Context from Knowledge Base:
{context}

Generate a PRP using ReAct reasoning. Use proper markdown formatting.""",
}


# ─── Models ──────────────────────────────────────────────────────────────────

class HistoryMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    mode: str = "chat"          # "chat" or "prp"
    framework: str = "RTCFR"   # only used when mode="prp"
    space_id: str = "default"
    temperature: float = 0.7
    history: List[HistoryMessage] = []


class ChatResponse(BaseModel):
    response: str
    sources: list = []
    mode: str = "chat"


# ─── Helpers ─────────────────────────────────────────────────────────────────

def get_llm(temperature: float = 0.7, api_key: str = None) -> ChatGroq:
    """Create a ChatGroq LLM instance."""
    key = api_key or GROQ_API_KEY
    if not key or key == "your_groq_api_key_here":
        raise HTTPException(
            status_code=400,
            detail="Groq API key not configured. Please set GROQ_API_KEY in the backend .env file or provide it in Settings."
        )
    return ChatGroq(
        model=MODEL_NAME,
        api_key=key,
        temperature=temperature,
    )


def get_or_create_collection(space_id: str):
    """Get or create a ChromaDB collection for a space."""
    collection_name = f"space_{space_id}"
    try:
        return chroma_client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"}
        )
    except Exception as e:
        print(f"Error creating collection: {e}")
        return chroma_client.create_collection(name=collection_name)


def extract_text_from_file(file_path: str, file_type: str) -> str:
    """Extract text from various file types."""
    text = ""
    print(f"[RAG] Extracting text from file: {file_path} (Type: {file_type})")

    try:
        if "pdf" in file_type or file_path.endswith(".pdf"):
            reader = PdfReader(file_path)
            for i, page in enumerate(reader.pages):
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            print(f"[RAG] Extracted {len(text)} characters from PDF")

        elif "wordprocessingml" in file_type or file_path.endswith(".docx"):
            doc = Document(file_path)
            for para in doc.paragraphs:
                if para.text:
                    text += para.text + "\n"
            print(f"[RAG] Extracted {len(text)} characters from DOCX")

        elif "text" in file_type or file_path.endswith((".txt", ".md", ".csv")):
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()
            print(f"[RAG] Extracted {len(text)} characters from TXT/MD")
            
        else:
            print(f"[RAG] Unsupported file type: {file_type}. Attempting default text read.")
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()

    except Exception as e:
        print(f"[RAG] ERROR extracting text: {e}")

    return text


def get_relevant_context(collection, query: str, n_results: int = 4) -> str:
    """Retrieve relevant context from the vector store."""
    try:
        collection_count = collection.count()
        print(f"[RAG] Searching context in collection containing {collection_count} chunks...")
        if collection_count == 0:
            return ""
            
        # Ensure we don't request more results than available in collection
        actual_n = min(n_results, collection_count)
            
        query_embedding = embeddings.embed_query(query)
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=actual_n
        )
        
        if results and results["documents"] and results["documents"][0]:
            retrieved = "\n\n---\n\n".join(results["documents"][0])
            print(f"[RAG] Successfully retrieved {len(results['documents'][0])} document chunks")
            return retrieved
            
        print("[RAG] Query successful but returned empty documents")
        return ""
    except Exception as e:
        print(f"[RAG] Error retrieving context: {e}")
        import traceback
        traceback.print_exc()
        return ""


def build_history_messages(history: List[HistoryMessage]):
    """Convert history dicts to LangChain message objects."""
    messages = []
    for msg in history[-10:]:  # Keep last 10 messages for context
        if msg.role == "user":
            messages.append(HumanMessage(content=msg.content))
        elif msg.role == "assistant":
            messages.append(AIMessage(content=msg.content))
    return messages


# ─── Routes ──────────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {"message": "PRPFIY Backend is running", "status": "healthy", "model": MODEL_NAME}


@app.get("/health")
async def health_check():
    """Check if the Groq API is reachable."""
    try:
        llm = get_llm(temperature=0.1)
        response = llm.invoke("Say 'OK'")
        return {"status": "healthy", "provider": "groq", "model": MODEL_NAME}
    except HTTPException as e:
        return {"status": "unhealthy", "error": e.detail}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}


@app.post("/upload")
async def upload_document(file: UploadFile = File(...), space_id: str = Form("default")):
    """Upload and process a document for RAG."""
    print(f"[RAG] Uploading file: {file.filename} to space: {space_id}")
    try:
        # Save file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=file.filename) as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name

        # Extract text
        text = extract_text_from_file(tmp_path, file.content_type or "")

        if not text.strip():
            print(f"[RAG] Warning: No text could be extracted from {file.filename}")
            raise HTTPException(status_code=400, detail="Could not extract text from document. Ensure it's not scanned or empty.")

        # Split into chunks
        chunks = text_splitter.split_text(text)
        print(f"[RAG] Split into {len(chunks)} chunks")

        # Get collection for space
        collection = get_or_create_collection(space_id)

        # Generate embeddings and store sequentially to avoid batch limits or mem issues temporarily
        print(f"[RAG] Generating embeddings and saving to ChromaDB...")
        
        # Batch insert to speed up
        batch_size = 100
        for i in range(0, len(chunks), batch_size):
            batch_chunks = chunks[i:i+batch_size]
            batch_embeddings = embeddings.embed_documents(batch_chunks)
            batch_ids = [f"{file.filename}_{i+j}_{uuid.uuid4().hex[:8]}" for j in range(len(batch_chunks))]
            batch_metadatas = [{"source": file.filename, "chunk": i+j} for j in range(len(batch_chunks))]
            
            collection.add(
                documents=batch_chunks,
                embeddings=batch_embeddings,
                ids=batch_ids,
                metadatas=batch_metadatas
            )
            
        print(f"[RAG] Successfully vectorized and stored {file.filename}")

        # Cleanup
        try:
            os.unlink(tmp_path)
        except:
            pass

        return {
            "status": "success",
            "filename": file.filename,
            "chunks_processed": len(chunks)
        }

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/fork-knowledge-base")
async def fork_knowledge_base(payload: dict):
    """Clone documents from one space collection to another."""
    try:
        source_id = payload.get("source_space_id")
        new_id = payload.get("new_space_id")
        
        if not source_id or not new_id:
            raise HTTPException(status_code=400, detail="Missing source or new space ID")
        
        # Get collections
        source_collection = get_or_create_collection(source_id)
        new_collection = get_or_create_collection(new_id)
        
        # Get all records from source
        records = source_collection.get(include=["documents", "metadatas", "embeddings"])
        
        # If there are records, insert them into the new collection
        if records and records.get("ids") and len(records["ids"]) > 0:
            new_collection.add(
                ids=records["ids"],
                embeddings=records.get("embeddings"),
                metadatas=records.get("metadatas"),
                documents=records.get("documents")
            )
            
        return {"status": "success", "message": f"Successfully forked {len(records.get('ids', []))} documents"}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Dual-mode chat endpoint.
    - mode="chat": Normal conversational AI response
    - mode="prp": PRP generation using the selected framework
    """
    try:
        llm = get_llm(temperature=request.temperature)

        # Build a better query for RAG using recent chat history
        recent_history_text = " ".join([msg.content for msg in request.history[-3:] if msg.role == "user"])
        rag_query = f"{recent_history_text} {request.message}".strip()

        # Get context from knowledge base
        collection = get_or_create_collection(request.space_id)
        context = get_relevant_context(collection, rag_query)
        context_text = context if context else "No documents uploaded yet."

        if request.mode == "prp":
            # ── PRP Generation Mode ──────────────────────────────────
            framework_prompt = FRAMEWORK_PROMPTS.get(
                request.framework,
                FRAMEWORK_PROMPTS["RTCFR"]
            )

            messages = [
                SystemMessage(content="""You are an expert Product Manager who creates detailed, professional Product Requirement Prompts. 
CRITICAL INSTRUCTIONS:
1. OUTPUT ONLY THE PROMPT ITSELF.
2. DO NOT include any conversational filler, preambles, or postambles (e.g., "Here is the prompt...", "Hope this helps", "Explanation:").
3. DO NOT include the framework name or 'Product Requirement Prompt' in your output headers.
4. Start immediately with the first section of the framework and end exactly after the last section. No extra text allowed.""")
            ]
            
            history_msgs = build_history_messages(request.history)
            if history_msgs:
                messages.extend(history_msgs)
                
            messages.append(
                HumanMessage(content=framework_prompt.format(
                    user_input=rag_query,
                    context=context_text
                ) + "\n\nCRITICAL INSTRUCTION: Stop generating immediately after the last section of the framework. DO NOT add any concluding sentences, summaries, meta-commentary, or explanations about how the prompt helps.")
            )

            response = llm.invoke(messages)

            final_response = response.content

            return ChatResponse(
                response=final_response,
                sources=[],
                mode="prp"
            )

        else:
            # ── Normal Chat Mode ─────────────────────────────────────
            system_msg = SystemMessage(content=CHAT_SYSTEM_PROMPT.format(context=context_text))
            history_msgs = build_history_messages(request.history)

            messages = [system_msg] + history_msgs + [HumanMessage(content=request.message)]

            response = llm.invoke(messages)

            return ChatResponse(
                response=response.content,
                sources=[],
                mode="chat"
            )

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api-key")
async def set_api_key(payload: dict):
    """Allow frontend to set the API key at runtime."""
    global GROQ_API_KEY
    key = payload.get("api_key", "")
    if not key:
        raise HTTPException(status_code=400, detail="API key is required")
    GROQ_API_KEY = key
    return {"status": "success", "message": "API key updated"}


@app.delete("/knowledge-base/{space_id}")
async def clear_knowledge_base(space_id: str):
    """Clear the knowledge base for a space."""
    try:
        collection_name = f"space_{space_id}"
        chroma_client.delete_collection(collection_name)
        return {"status": "success", "message": "Knowledge base cleared"}
    except Exception as e:
        return {"status": "warning", "message": "Collection may not exist"}


if __name__ == "__main__":
    import uvicorn
    print(f"Starting PRPFIY Backend with Groq ({MODEL_NAME})...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
