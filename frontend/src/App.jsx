import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  FiSend, 
  FiPaperclip, 
  FiX, 
  FiLoader, 
  FiCheck, 
  FiAlertCircle, 
  FiMenu, 
  FiMessageSquare,
  FiFileText,
  FiSettings,
  FiChevronDown,
  FiArrowDown,
  FiUpload,
  FiFile,
  FiAlertTriangle,
  FiInfo
} from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import ChatMessage from './components/ChatMessage';
import FileUpload from './components/FileUpload';

// API base URL
const API_URL = 'http://localhost:8000';

// Initial system message
const INITIAL_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  content: "Hello! I'm your document assistant. You can upload PDF or TXT files and ask me questions about their content. I'll help you find information and answer your questions based on the documents you provide.",
  timestamp: new Date().toISOString(),
};

// Sample documents for the sidebar
const sampleDocuments = [
  { id: '1', name: 'Project_Requirements.pdf', type: 'pdf', size: '2.4 MB', uploaded: '2 hours ago' },
  { id: '2', name: 'Technical_Documentation.txt', type: 'txt', size: '1.1 MB', uploaded: '1 day ago' },
  { id: '3', name: 'Research_Paper.pdf', type: 'pdf', size: '3.7 MB', uploaded: '3 days ago' },
];

function App() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [activeDocument, setActiveDocument] = useState(null);
  const [showDocuments, setShowDocuments] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);

  // Generate a unique ID for messages
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Scroll to bottom of chat when messages change
  const scrollToBottom = useCallback((behavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  }, []);

  // Handle scroll events to show/hide scroll-to-bottom button
  const handleScroll = useCallback(() => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isNearBottom = scrollHeight - (scrollTop + clientHeight) < 100;
      setShowScrollButton(!isNearBottom);
    }
  }, []);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom('auto');
  }, [messages, scrollToBottom]);

  // Set up scroll event listener
  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Focus input on load
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    // Add user message to chat
    const userMessage = { 
      id: generateId(),
      role: 'user', 
      content: trimmedInput,
      timestamp: new Date().toISOString()
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Send request to backend
      const response = await axios.post(`${API_URL}/ask`, {
        question: userMessage.content,
        document_id: activeDocument?.id
      });

      // Add assistant response to chat
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: 'assistant',
          content: response.data.response,
          timestamp: new Date().toISOString(),
          sources: response.data.sources || []
        },
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: 'assistant',
          content: 'Sorry, I encountered an error processing your request. Please try again later.',
          isError: true,
          timestamp: new Date().toISOString()
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (file) => {
    const fileId = generateId();
    
    setUploadStatus({
      id: fileId,
      loading: true,
      message: `Uploading ${file.name}...`,
      success: null,
      file: {
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        type: file.type.split('/').pop().toUpperCase()
      },
      progress: 0
    });
    
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setUploadStatus(prev => ({
            ...prev,
            progress,
            message: `Uploading ${file.name}... ${progress}%`
          }));
        },
      });

      // Add document to the list
      const newDocument = {
        id: fileId,
        name: file.name,
        type: file.type.split('/').pop(),
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        uploaded: 'Just now'
      };

      setUploadStatus({
        id: fileId,
        loading: false,
        success: true,
        message: `Successfully uploaded ${file.name}`,
        file: newDocument,
        progress: 100
      });

      // Auto-dismiss success message after 5 seconds
      setTimeout(() => {
        setUploadStatus(null);
      }, 5000);

      return newDocument;
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus({
        id: fileId,
        loading: false,
        success: false,
        message: `Failed to upload ${file.name}. ${error.response?.data?.detail || error.message}`,
        file: {
          name: file.name,
          size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
          type: file.type.split('/').pop().toUpperCase()
        },
        progress: 0
      });
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // Handle document selection
  const handleDocumentSelect = (doc) => {
    setActiveDocument(doc);
    setShowDocuments(false);
    
    // Add a system message when a document is selected
    setMessages(prev => [
      ...prev,
      {
        id: generateId(),
        role: 'system',
        content: `Now chatting with ${doc.name}`,
        timestamp: new Date().toISOString(),
        isSystem: true
      }
    ]);
  };

  // Handle clearing the chat
  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat history? This cannot be undone.')) {
      setMessages([INITIAL_MESSAGE]);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    // Send message on Cmd+Enter or Ctrl+Enter
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      handleSendMessage(e);
    }
  };

  // Render the document list
  const renderDocumentList = () => (
    <div className="document-list">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Documents</h3>
        <button
          onClick={() => setShowDocuments(false)}
          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-label="Hide documents"
        >
          <FiX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>
      </div>
      
      <div className="space-y-2 mb-4">
        {sampleDocuments.map((doc) => (
          <div
            key={doc.id}
            className={`document-preview flex items-center p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${
              activeDocument?.id === doc.id ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800' : ''
            }`}
            onClick={() => handleDocumentSelect(doc)}
          >
            <div className="document-preview-icon mr-3">
              <FiFileText className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {doc.name}
              </p>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-800 dark:text-gray-200 mr-2">
                  {doc.type.toUpperCase()}
                </span>
                <span>{doc.size}</span>
                <span className="mx-1">•</span>
                <span>{doc.uploaded}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <FileUpload onFileUpload={handleFileUpload} isUploading={isUploading} />
    </div>
  );

  // Render the chat interface
  const renderChatInterface = () => (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => setShowDocuments(true)}
            className="md:hidden mr-2 p-1 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Show documents"
          >
            <FiMenu className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {activeDocument ? activeDocument.name : 'New Chat'}
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleClearChat}
            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            title="New chat"
          >
            <FiMessageSquare className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowDocuments(!showDocuments)}
            className="hidden md:flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <FiFileText className="w-4 h-4" />
            <span>Documents</span>
          </button>
        </div>
      </div>
      
      {/* Messages container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900"
      >
        <div className="max-w-3xl mx-auto w-full space-y-4">
          {messages.map((message, index) => (
            <div key={`${message.id || index}`} className="message-container">
              <ChatMessage 
                message={message} 
                isLast={index === messages.length - 1}
              />
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center space-x-2 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input area */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <div className="max-w-3xl mx-auto">
          {uploadStatus && (
            <div className={`mb-4 p-3 rounded-lg ${
              uploadStatus.success === true 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
                : uploadStatus.success === false 
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200' 
                  : 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
            }`}>
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  {uploadStatus.loading ? (
                    <FiLoader className="w-5 h-5 animate-spin" />
                  ) : uploadStatus.success ? (
                    <FiCheck className="w-5 h-5" />
                  ) : (
                    <FiAlertCircle className="w-5 h-5" />
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium">
                    {uploadStatus.message}
                  </p>
                  {uploadStatus.progress > 0 && uploadStatus.progress < 100 && (
                    <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300 ease-out" 
                        style={{ width: `${uploadStatus.progress}%` }}
                      />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setUploadStatus(null)}
                  className="ml-4 -mt-1 -mr-2 p-1 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  aria-label="Dismiss"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSendMessage} className="relative">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message here..."
                className="message-input pr-12"
                rows={1}
                disabled={isLoading}
              />
              <div className="absolute right-2 bottom-2 flex space-x-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading || isUploading}
                  className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Attach file"
                >
                  <FiPaperclip className="w-5 h-5" />
                </button>
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={`p-1.5 rounded-full ${
                    !input.trim() || isLoading
                      ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                      : 'text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700'
                  } transition-colors`}
                  title="Send message"
                >
                  <FiSend className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Press Ctrl+Enter to send</span>
              <span>{input.length} / 2000</span>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileUpload(e.target.files[0]);
                  e.target.value = ''; // Reset the input
                }
              }}
              accept=".pdf,.txt"
              className="hidden"
              disabled={isUploading}
            />
          </form>
        </div>
      </div>
      
      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={() => scrollToBottom('smooth')}
          className="scroll-to-bottom"
          aria-label="Scroll to bottom"
        >
          <FiArrowDown className="w-5 h-5" />
        </button>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Sidebar - Desktop */}
      <div className={`hidden md:flex md:flex-shrink-0 w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col h-full ${showDocuments ? 'flex' : 'hidden'}`}>
        {renderDocumentList()}
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {renderChatInterface()}
      </div>
      
      {/* Mobile sidebar overlay */}
      {showDocuments && (
        <div className="md:hidden fixed inset-0 z-40">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setShowDocuments(false)}
          />
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white dark:bg-gray-800 shadow-xl z-50 p-4 overflow-y-auto">
            {renderDocumentList()}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
