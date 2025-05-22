import { useState, useRef } from "react";
import axios from "axios";
import ChatMessage from "./components/ChatMessage";
import FileUpload from "./components/FileUpload";

// API base URL
const API_URL = "http://localhost:8000";

function App() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm your domain-specific assistant. Ask me anything about the uploaded documents, or upload a new PDF to get started.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Add user message to chat
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Send request to backend
      const response = await axios.post(`${API_URL}/ask`, {
        question: userMessage.content,
      });

      // Add assistant response to chat
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.data.response,
        },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I encountered an error processing your request. Please try again later.",
        },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  // Handle file upload
  const handleFileUpload = async (file) => {
    setUploadStatus({ loading: true, message: `Uploading ${file.name}...` });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setUploadStatus({
        success: true,
        message: `Successfully processed ${file.name}. You can now ask questions about it!`,
      });

      // Add system message about successful upload
      setMessages((prev) => [
        ...prev,
        {
          role: "system",
          content: `📄 Document "${file.name}" has been uploaded and processed. You can now ask questions about it.`,
        },
      ]);

      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadStatus({
        success: false,
        message:
          error.response?.data?.message ||
          "Error uploading file. Please try again.",
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Domain-Specific RAG Chatbot
          </h1>
          <FileUpload onFileUpload={handleFileUpload} />
        </div>
      </header>

      {/* Upload Status Alert */}
      {uploadStatus && (
        <div
          className={`px-4 py-2 ${
            uploadStatus.success
              ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
              : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
          }`}
        >
          {uploadStatus.message}
          <button
            onClick={() => setUploadStatus(null)}
            className="ml-2 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="bg-white dark:bg-gray-800 border-t dark:border-gray-700 p-4">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your documents..."
            className="input flex-1 mr-2"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "Thinking..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
