from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
import os
import logging
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
import tempfile
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
google_api_key = os.getenv("GOOGLE_API_KEY")
if not google_api_key:
    raise ValueError("GOOGLE_API_KEY environment variable not set")

# Initialize LLM and embeddings
# Using Gemini 1.5 Flash which might have more available quota
llm = ChatGoogleGenerativeAI(model="models/gemini-1.5-flash", google_api_key=google_api_key)
embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=google_api_key)

# Default persist directory for ChromaDB
PERSIST_DIRECTORY = "./chroma_db"

# Custom prompt template for better answers
QA_PROMPT = """You are an AI assistant providing helpful, accurate, and concise answers based on the provided context.

Context:
{context}

Question:
{question}

Instructions:
1. Answer the question based ONLY on the provided context.
2. If the context doesn't contain the answer, say "I don't have enough information to answer this question."
3. Keep your answer concise and to the point.
4. If appropriate, use bullet points or numbered lists for clarity.
5. Do not make up information or use knowledge outside of the provided context.

Answer:
"""

PROMPT = PromptTemplate(
    template=QA_PROMPT,
    input_variables=["context", "question"]
)

class RAGEngine:
    def __init__(self, persist_directory: str = PERSIST_DIRECTORY):
        """Initialize the RAG Engine with a persistent vector store."""
        self.persist_directory = persist_directory
        self.vectordb = None
        self.retriever = None
        self.qa_chain = None
        
        # Try to load existing vector store
        self._initialize_from_existing_db()
    
    def _initialize_from_existing_db(self):
        """Initialize from existing ChromaDB if available."""
        try:
            if os.path.exists(self.persist_directory):
                logger.info(f"Loading existing vector store from {self.persist_directory}")
                self.vectordb = Chroma(persist_directory=self.persist_directory, embedding_function=embeddings)
                self.retriever = self.vectordb.as_retriever(search_kwargs={"k": 4})
                self._setup_qa_chain()
                return True
            return False
        except Exception as e:
            logger.error(f"Error loading existing vector store: {e}")
            return False
    
    def _setup_qa_chain(self):
        """Set up the QA chain with the retriever."""
        self.qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=self.retriever,
            chain_type_kwargs={"prompt": PROMPT}
        )
    
    def load_pdf(self, pdf_path: str) -> bool:
        """Load a PDF file and create/update the vector store."""
        try:
            logger.info(f"Loading PDF from {pdf_path}")
            # Load and process PDF
            loader = PyPDFLoader(pdf_path)
            pages = loader.load_and_split()
            
            # Use recursive text splitter for better chunking
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200,
                length_function=len,
                separators=["\n\n", "\n", " ", ""]
            )
            docs = text_splitter.split_documents(pages)
            
            if not docs:
                logger.warning("No documents extracted from PDF")
                return False
            
            logger.info(f"Extracted {len(docs)} document chunks from PDF")
            
            # Create or update vector store
            self.vectordb = Chroma.from_documents(
                documents=docs, 
                embedding=embeddings, 
                persist_directory=self.persist_directory
            )
            # Note: persist() is no longer needed as Chroma 0.4.x+ automatically persists
            self.retriever = self.vectordb.as_retriever(search_kwargs={"k": 4})
            self._setup_qa_chain()
            return True
        except Exception as e:
            logger.error(f"Error loading PDF: {e}")
            return False
    
    def load_pdf_from_bytes(self, pdf_bytes: bytes, filename: str = "uploaded_document.pdf") -> bool:
        """Load a PDF from bytes (for file upload functionality)."""
        try:
            # Create a temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
                temp_file.write(pdf_bytes)
                temp_path = temp_file.name
            
            # Process the PDF
            result = self.load_pdf(temp_path)
            
            # Clean up
            os.unlink(temp_path)
            return result
        except Exception as e:
            logger.error(f"Error loading PDF from bytes: {e}")
            return False
    
    def get_answer(self, query: str) -> Dict[str, Any]:
        """Get an answer for a query using the RAG pipeline."""
        if not self.qa_chain:
            return {
                "answer": "The knowledge base has not been loaded yet. Please upload a document first.",
                "success": False
            }
        
        try:
            answer = self.qa_chain.run(query)
            return {
                "answer": answer,
                "success": True
            }
        except Exception as e:
            logger.error(f"Error getting answer: {e}")
            return {
                "answer": f"An error occurred while processing your query: {str(e)}",
                "success": False
            }

# Initialize the RAG engine with default PDF
rag_engine = RAGEngine()

# Load the default knowledge base if it exists
default_pdf_path = os.path.join(os.path.dirname(__file__), "knowledge_base.pdf")
if os.path.exists(default_pdf_path):
    rag_engine.load_pdf(default_pdf_path)

def get_answer(query: str) -> str:
    """Legacy function for backward compatibility."""
    result = rag_engine.get_answer(query)
    return result["answer"]