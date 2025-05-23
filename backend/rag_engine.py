from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
import os
import logging
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
import tempfile
from pathlib import Path
from langchain.docstore.document import Document

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

# Default directories
PERSIST_DIRECTORY = "./chroma_db"
KNOWLEDGE_BASE_DIR = os.path.join(os.path.dirname(__file__), "knowledge_base")

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
    
    def _load_documents(self, file_path: str) -> list:
        """Load documents from a file (PDF or TXT)."""
        try:
            if file_path.lower().endswith('.pdf'):
                loader = PyPDFLoader(file_path)
                pages = loader.load_and_split()
                logger.info(f"Loaded PDF: {file_path}")
                return pages
            elif file_path.lower().endswith('.txt'):
                loader = TextLoader(file_path, encoding='utf-8')
                pages = loader.load_and_split()
                logger.info(f"Loaded TXT: {file_path}")
                return pages
            else:
                logger.warning(f"Unsupported file format: {file_path}")
                return []
        except Exception as e:
            logger.error(f"Error loading {file_path}: {e}")
            return []

    def load_documents(self, file_paths: list) -> bool:
        """Load multiple files and create/update the vector store."""
        try:
            all_docs = []
            for file_path in file_paths:
                if not os.path.exists(file_path):
                    logger.warning(f"File not found: {file_path}")
                    continue
                docs = self._load_documents(file_path)
                # Attach source filename as metadata
                for doc in docs:
                    doc.metadata = doc.metadata or {}
                    doc.metadata["source"] = os.path.basename(file_path)
                if docs:
                    all_docs.extend(docs)
            if not all_docs:
                logger.warning("No valid documents found in the provided files")
                return False
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000,
                chunk_overlap=200,
                length_function=len,
                separators=["\n\n", "\n", " ", ""]
            )
            chunks = text_splitter.split_documents(all_docs)
            # Ensure metadata is preserved for each chunk
            for chunk, doc in zip(chunks, all_docs):
                chunk.metadata = chunk.metadata or {}
                if "source" in doc.metadata:
                    chunk.metadata["source"] = doc.metadata["source"]
            logger.info(f"Created {len(chunks)} document chunks from {len(all_docs)} documents")
            self.vectordb = Chroma.from_documents(
                documents=chunks, 
                embedding=embeddings, 
                persist_directory=self.persist_directory
            )
            self.retriever = self.vectordb.as_retriever(search_kwargs={"k": 4})
            self._setup_qa_chain()
            return True
        except Exception as e:
            logger.error(f"Error loading documents: {e}")
            return False
            
    def load_knowledge_base(self) -> bool:
        """Load all supported files from the knowledge base directory."""
        if not os.path.exists(KNOWLEDGE_BASE_DIR):
            logger.info(f"Knowledge base directory not found, creating: {KNOWLEDGE_BASE_DIR}")
            os.makedirs(KNOWLEDGE_BASE_DIR, exist_ok=True)
            return False
            
        # Get all PDF and TXT files from the knowledge base directory
        supported_extensions = ('.pdf', '.txt')
        file_paths = []
        
        for root, _, files in os.walk(KNOWLEDGE_BASE_DIR):
            for file in files:
                if file.lower().endswith(supported_extensions):
                    file_paths.append(os.path.join(root, file))
        
        if not file_paths:
            logger.warning(f"No supported files found in {KNOWLEDGE_BASE_DIR}")
            return False
            
        logger.info(f"Found {len(file_paths)} supported files in knowledge base")
        return self.load_documents(file_paths)
    
    def upload_document(self, file_bytes: bytes, filename: str) -> bool:
        """Upload a document to the knowledge base and update the vector store."""
        try:
            # Ensure knowledge base directory exists
            os.makedirs(KNOWLEDGE_BASE_DIR, exist_ok=True)
            
            # Save the file to the knowledge base directory
            file_path = os.path.join(KNOWLEDGE_BASE_DIR, filename)
            with open(file_path, 'wb') as f:
                f.write(file_bytes)
                
            logger.info(f"Saved uploaded file to {file_path}")
            
            # Reload the entire knowledge base with the new file
            return self.load_knowledge_base()
            
        except Exception as e:
            logger.error(f"Error uploading document: {e}")
            return False
    
    def get_answer(self, query: str, document_id: Optional[str] = None) -> Dict[str, Any]:
        """Get an answer for a query using the RAG pipeline, optionally filtering by document."""
        if not self.vectordb:
            return {
                "answer": "The knowledge base has not been loaded yet. Please upload a document first.",
                "success": False
            }
        try:
            if document_id:
                # Filter retriever to only use chunks from the selected document
                docs = self.vectordb.similarity_search(query, k=8, filter={"source": document_id})
                if not docs:
                    return {"answer": "No relevant content found in the selected document.", "success": False}
                context = "\n".join([doc.page_content for doc in docs])
                answer = llm.invoke(f"Context:\n{context}\n\nQuestion:\n{query}")
                return {"answer": answer.content if hasattr(answer, 'content') else str(answer), "success": True}
            else:
                answer = self.qa_chain.run(query)
                return {"answer": answer, "success": True}
        except Exception as e:
            logger.error(f"Error getting answer: {e}")
            return {"answer": f"An error occurred while processing your query: {str(e)}", "success": False}

# Initialize the RAG engine
rag_engine = RAGEngine()

# Load documents from the knowledge base directory
rag_engine.load_knowledge_base()

def get_answer(query: str) -> str:
    """Legacy function for backward compatibility."""
    result = rag_engine.get_answer(query)
    return result["answer"]