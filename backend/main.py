"""
PRPFIY Backend - Local Ollama LLama3 Integration
Uses AIR (Align-Improve-Refine) method with LangChain
"""

import os
import uuid
from typing import Optional
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import chromadb
from chromadb.config import Settings
from langchain_community.llms import Ollama
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
import tempfile
import shutil

# Document processors
from pypdf import PdfReader
from docx import Document

app = FastAPI(title="PRPFIY Backend", version="1.0.0")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ChromaDB for vector storage
chroma_client = chromadb.Client(Settings(
    chroma_db_impl="duckdb+parquet",
    persist_directory="./chroma_db",
    anonymized_telemetry=False
))

# Initialize embeddings
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

# Framework prompts
FRAMEWORK_PROMPTS = {
    "RTCFR": """You are a Product Manager creating a Product Requirement Prompt (PRP).
Use the RTCFR framework:
- Role: Define who you are in this context
- Task: What needs to be accomplished
- Context: Background information and constraints
- Format: How the output should be structured
- Requirements: Specific functional and non-functional requirements

User Request: {user_input}

Context from Knowledge Base:
{context}

Generate a comprehensive PRP using the RTCFR framework:""",

    "RTF": """You are a Product Manager creating a Product Requirement Prompt (PRP).
Use the RTF framework:
- Role: Your role in this context
- Task: What needs to be done
- Format: Output structure

User Request: {user_input}

Context from Knowledge Base:
{context}

Generate a PRP using the RTF framework:""",

    "CRISPE": """You are a Product Manager creating a Product Requirement Prompt (PRP).
Use the CRISPE framework:
- Capacity: Your role and capabilities
- Request: What is being asked
- Insight: Key insights and analysis
- Statement: Clear problem statement
- Personality: Communication style
- Experiment: Testing approach

User Request: {user_input}

Context from Knowledge Base:
{context}

Generate a PRP using the CRISPE framework:""",

    "COSTAR": """You are a Product Manager creating a Product Requirement Prompt (PRP).
Use the COSTAR framework:
- Context: Background and situation
- Objective: Goals to achieve
- Style: Writing style
- Tone: Communication tone
- Audience: Target readers
- Response: Expected output format

User Request: {user_input}

Context from Knowledge Base:
{context}

Generate a PRP using the COSTAR framework:""",

    "TASK-SPEC": """You are a Product Manager creating a Product Requirement Prompt (PRP).
Use the TASK-SPEC framework:
- Task: The main objective
- Action: Steps to accomplish
- Style: Presentation style
- Knowledge: Required knowledge
- Special: Special considerations
- Persona: User personas
- Examples: Reference examples
- Constraints: Limitations

User Request: {user_input}

Context from Knowledge Base:
{context}

Generate a PRP using the TASK-SPEC framework:""",

    "A-I-C": """You are a Product Manager creating a Product Requirement Prompt (PRP).
Use the A-I-C framework:
- Actor: Who is involved
- Instruction: What to do
- Context: Relevant background

User Request: {user_input}

Context from Knowledge Base:
{context}

Generate a PRP using the A-I-C framework:""",

    "SPAR": """You are a Product Manager creating a Product Requirement Prompt (PRP).
Use the SPAR framework:
- Situation: Current state
- Problem: Issues to address
- Action: Proposed solutions
- Result: Expected outcomes

User Request: {user_input}

Context from Knowledge Base:
{context}

Generate a PRP using the SPAR framework:""",

    "CoT": """You are a Product Manager creating a Product Requirement Prompt (PRP).
Use Chain of Thought reasoning to break down the requirements step by step.

User Request: {user_input}

Context from Knowledge Base:
{context}

Think through this step by step and generate a comprehensive PRP:""",

    "ReAct": """You are a Product Manager creating a Product Requirement Prompt (PRP).
Use the ReAct framework combining Reasoning and Acting:
1. Thought: Analyze the request
2. Action: Define what needs to be done
3. Observation: Review and refine

User Request: {user_input}

Context from Knowledge Base:
{context}

Generate a PRP using ReAct reasoning:""",
}


class ChatRequest(BaseModel):
    message: str
    framework: str = "RTCFR"
    space_id: str
    temperature: float = 0.7


class ChatResponse(BaseModel):
    response: str
    sources: list = []


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
    
    if file_type == "application/pdf" or file_path.endswith(".pdf"):
        reader = PdfReader(file_path)
        for page in reader.pages:
            text += page.extract_text() + "\n"
    
    elif file_type in ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"] or file_path.endswith(".docx"):
        doc = Document(file_path)
        for para in doc.paragraphs:
            text += para.text + "\n"
    
    elif file_type == "text/plain" or file_path.endswith(".txt") or file_path.endswith(".md"):
        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read()
    
    return text


def get_relevant_context(collection, query: str, n_results: int = 3) -> str:
    """Retrieve relevant context from the vector store."""
    try:
        # Get embeddings for query
        query_embedding = embeddings.embed_query(query)
        
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results
        )
        
        if results and results["documents"]:
            return "\n\n".join(results["documents"][0])
        return "No relevant context found in knowledge base."
    except Exception as e:
        print(f"Error retrieving context: {e}")
        return "No context available."


@app.get("/")
async def root():
    return {"message": "PRPFIY Backend is running", "status": "healthy"}


@app.get("/health")
async def health_check():
    """Check if Ollama is available."""
    try:
        llm = Ollama(model="llama3", base_url="http://localhost:11434")
        # Simple test
        response = llm.invoke("Say 'OK'")
        return {"status": "healthy", "ollama": "connected", "model": "llama3"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}


@app.post("/upload")
async def upload_document(file: UploadFile = File(...), space_id: str = "default"):
    """Upload and process a document for RAG."""
    try:
        # Save file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=file.filename) as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name
        
        # Extract text
        text = extract_text_from_file(tmp_path, file.content_type or "")
        
        if not text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from document")
        
        # Split into chunks
        chunks = text_splitter.split_text(text)
        
        # Get collection for space
        collection = get_or_create_collection(space_id)
        
        # Generate embeddings and store
        for i, chunk in enumerate(chunks):
            chunk_embedding = embeddings.embed_query(chunk)
            collection.add(
                documents=[chunk],
                embeddings=[chunk_embedding],
                ids=[f"{file.filename}_{i}_{uuid.uuid4().hex[:8]}"],
                metadatas=[{"source": file.filename, "chunk": i}]
            )
        
        # Cleanup
        os.unlink(tmp_path)
        
        return {
            "status": "success",
            "filename": file.filename,
            "chunks_processed": len(chunks)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Process a chat message and generate PRP using AIR method with Ollama."""
    try:
        # Initialize Ollama LLM
        llm = Ollama(
            model="llama3",
            base_url="http://localhost:11434",
            temperature=request.temperature,
        )
        
        # Get context from knowledge base
        collection = get_or_create_collection(request.space_id)
        context = get_relevant_context(collection, request.message)
        
        # Get framework prompt
        framework_prompt = FRAMEWORK_PROMPTS.get(
            request.framework, 
            FRAMEWORK_PROMPTS["RTCFR"]
        )
        
        # Create prompt template
        prompt = PromptTemplate(
            input_variables=["user_input", "context"],
            template=framework_prompt
        )
        
        # Create chain
        chain = LLMChain(llm=llm, prompt=prompt)
        
        # AIR Method: Align-Improve-Refine
        # Step 1: Align - Generate initial response
        aligned_response = chain.run(user_input=request.message, context=context)
        
        # Step 2: Improve - Refine the response (using self-critique)
        improve_prompt = f"""Review and improve this Product Requirement Prompt:

{aligned_response}

Make it more:
1. Specific and actionable
2. Well-structured with clear sections
3. Complete with all necessary details

Improved version:"""
        
        improved_response = llm.invoke(improve_prompt)
        
        # Step 3: Refine - Final polish
        refine_prompt = f"""Final refinement of this PRP - ensure it's professional and complete:

{improved_response}

Add a proper header with framework used ({request.framework}) and ensure all sections are well-formatted in Markdown.

Final refined PRP:"""
        
        final_response = llm.invoke(refine_prompt)
        
        return ChatResponse(
            response=final_response,
            sources=[]
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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
    uvicorn.run(app, host="0.0.0.0", port=8000)
