# RAG Chatbot Usage Guide

This guide provides detailed instructions on how to use the Domain-Specific RAG Chatbot.

## Getting Started

### Prerequisites

Before using the chatbot, ensure you have:

1. A Google AI API key (for Gemini Pro)
2. PDF documents containing domain-specific information
3. Python 3.13+ and Node.js 18+ installed

### Initial Setup

1. Clone the repository and navigate to the project directory
2. Set up your Google API key in `backend/.env`
3. Install backend dependencies: `pip install -r requirements.txt`
4. Install frontend dependencies: `cd frontend && npm install`

## Running the Application

You can run the application in two ways:

### Option 1: Using the run script

```bash
./run.sh
```

This script starts both the backend and frontend servers simultaneously.

### Option 2: Starting servers separately

**Backend:**

```bash
cd backend
uvicorn main:app --reload
```

**Frontend:**

```bash
cd frontend
npm run dev
```

## Using the Chatbot

### Uploading Documents

1. Click the "Upload PDF" button in the top-right corner of the interface
2. Select a PDF file from your computer or drag and drop it onto the button
3. Wait for the confirmation message that the document has been processed
4. You can now ask questions about the content of the uploaded document

### Asking Questions

1. Type your question in the input field at the bottom of the screen
2. Press Enter or click the "Send" button
3. The chatbot will process your question and provide an answer based on the content of the uploaded documents
4. The answer will appear in the chat interface

### Best Practices for Questions

For optimal results:

- Ask specific questions related to the content of the uploaded documents
- Provide context in your questions when necessary
- Break down complex queries into simpler questions
- Use clear and concise language

### Example Questions

Depending on your uploaded documents, you might ask:

- "What are the key features of [product/service]?"
- "How do I implement [specific process] according to the documentation?"
- "What are the requirements for [specific task]?"
- "Can you explain the concept of [term] mentioned in the document?"
- "What are the steps to complete [procedure]?"

## Troubleshooting

### Common Issues

1. **Document not processing:**

   - Ensure the PDF is not password-protected
   - Check that the file is a valid PDF
   - Try uploading a smaller document if the current one is very large

2. **Irrelevant answers:**

   - Make your questions more specific
   - Ensure your document contains the information you're asking about
   - Try rephrasing your question

3. **Backend connection issues:**
   - Verify that the backend server is running
   - Check that the API URL is correctly set in the frontend
   - Ensure your Google API key is valid

### Getting Help

If you encounter issues not covered in this guide, please:

1. Check the console logs in your browser for frontend errors
2. Check the terminal running the backend server for backend errors
3. Refer to the project documentation or open an issue on the project repository

## Advanced Features

### Customizing the RAG Pipeline

You can customize the RAG pipeline by modifying the `rag_engine.py` file:

- Adjust the chunk size and overlap for document splitting
- Modify the retrieval parameters (e.g., number of chunks retrieved)
- Customize the prompt template for better answers

### Adding Authentication

For production use, consider adding authentication to protect your API and documents:

1. Implement an authentication system in the FastAPI backend
2. Add login/signup functionality to the frontend
3. Secure API endpoints with authentication middleware

## Privacy and Security Considerations

- The chatbot processes documents locally and does not store them externally
- Queries are sent to Google's Gemini API for processing
- Consider the sensitivity of documents you upload and ensure compliance with relevant data protection regulations
