# Domain-Specific RAG Chatbot

A professional conversational AI system that answers questions from domain-specific documents using Retrieval-Augmented Generation (RAG).

## Features

- **Gemini Pro LLM Integration**: Leverages Google's Gemini Pro for natural language understanding and generation
- **RAG Pipeline**: Uses LangChain and ChromaDB for semantic search and context retrieval
- **PDF Processing**: Ingests and processes PDF documents to build a knowledge base
- **Modern UI**: React-based interface with Tailwind CSS for a clean, responsive design
- **File Upload**: Drag-and-drop PDF upload functionality
- **FastAPI Backend**: High-performance API with automatic documentation

## Tech Stack

### Backend

- Python 3.13+
- FastAPI
- LangChain
- Google Generative AI (Gemini Pro)
- ChromaDB
- PyPDF Loader

### Frontend

- React 18
- Vite
- Tailwind CSS
- Axios

## Getting Started

### Prerequisites

- Python 3.13+
- Node.js 18+
- Google AI API key

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/AI_RAG_Chatbot.git
cd AI_RAG_Chatbot
```

2. Set up the backend

```bash
# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
echo "GOOGLE_API_KEY=your_google_api_key" > backend/.env
```

3. Set up the frontend

```bash
cd frontend
npm install
```

### Running the Application

1. Start the backend server

```bash
cd backend
uvicorn main:app --reload
```

2. Start the frontend development server

```bash
cd frontend
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

## Usage

1. Upload a PDF document using the upload button in the header
2. Wait for the document to be processed
3. Ask questions about the content of the document
4. Receive accurate, context-aware responses

## Project Structure

```
AI_RAG_Chatbot/
├── backend/
│   ├── chroma_db/         # Vector database storage
│   ├── knowledge_base.pdf # Default PDF document
│   ├── main.py            # FastAPI application
│   └── rag_engine.py      # RAG implementation
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/    # React components
│       ├── App.jsx        # Main application component
│       └── main.jsx       # Entry point
└── README.md
```

## License

MIT

## Acknowledgements

- [LangChain](https://github.com/langchain-ai/langchain)
- [Google Generative AI](https://ai.google.dev/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
