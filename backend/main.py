from fastapi import FastAPI, Request, File, UploadFile, HTTPException, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi
from rag_engine import rag_engine
import os
import logging
import uvicorn
from typing import Optional
from dotenv import load_dotenv
from pydantic import BaseModel

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Domain-Specific RAG Chatbot API",
    description="A FastAPI backend for a domain-specific RAG chatbot using Gemini Pro and LangChain",
    version="1.0.0",
)

# Allow frontend to access API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# Pydantic models for request/response validation
class QuestionRequest(BaseModel):
    question: str

class AnswerResponse(BaseModel):
    response: str
    success: bool

class UploadResponse(BaseModel):
    message: str
    success: bool
    filename: Optional[str] = None

# Root endpoint
@app.get("/")
def root():
    return {"message": "RAG Chatbot Backend is running", "status": "online"}

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Ask a question endpoint
@app.post("/ask", response_model=AnswerResponse)
async def ask_question(request: QuestionRequest):
    try:
        logger.info(f"Received question: {request.question}")
        result = rag_engine.get_answer(request.question)
        return {"response": result["answer"], "success": result["success"]}
    except Exception as e:
        logger.error(f"Error processing question: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing your question: {str(e)}")

# Upload PDF endpoint
@app.post("/upload", response_model=UploadResponse)
async def upload_pdf(file: UploadFile = File(...)):
    try:
        # Validate file type
        if not file.filename.lower().endswith('.pdf'):
            return JSONResponse(
                status_code=400,
                content={"message": "Only PDF files are allowed", "success": False}
            )
        
        # Read file content
        file_content = await file.read()
        
        # Process the PDF
        logger.info(f"Processing uploaded PDF: {file.filename}")
        success = rag_engine.load_pdf_from_bytes(file_content, file.filename)
        
        if success:
            return {
                "message": f"Successfully processed {file.filename}",
                "success": True,
                "filename": file.filename
            }
        else:
            return JSONResponse(
                status_code=500,
                content={
                    "message": f"Failed to process {file.filename}",
                    "success": False,
                    "filename": file.filename
                }
            )
    except Exception as e:
        logger.error(f"Error uploading file: {e}")
        return JSONResponse(
            status_code=500,
            content={"message": f"Error uploading file: {str(e)}", "success": False}
        )

# Custom OpenAPI schema
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title="Domain-Specific RAG Chatbot API",
        version="1.0.0",
        description="API for a domain-specific RAG chatbot using Gemini Pro and LangChain",
        routes=app.routes,
    )
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# Run the server if executed directly
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)