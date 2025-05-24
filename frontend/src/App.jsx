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
  const [documents, setDocuments] = useState([]);

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

  // Fetch documents from backend
  const fetchDocuments = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/documents`);
      // Map backend data to expected format
      const docs = (res.data.documents || []).map((doc, idx) => ({
        id: doc.name, // Use filename as id
        name: doc.name,
        type: doc.name.split('.').pop().toLowerCase(),
        size: (doc.size / (1024 * 1024)).toFixed(2) + ' MB',
        uploaded: formatDistanceToNow(new Date(doc.last_modified), { addSuffix: true })
      }));
      setDocuments(docs);
    } catch (err) {
      setDocuments([]);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

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

      // Re-fetch document list after upload
      await fetchDocuments();

      setUploadStatus({
        id: fileId,
        loading: false,
        message: `Successfully uploaded ${file.name}`,
        success: true,
        file: {
          name: file.name,
          size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
          type: file.type.split('/').pop().toUpperCase()
        },
        progress: 100
      });

      // Auto-dismiss success message after 5 seconds
      setTimeout(() => {
        setUploadStatus(null);
      }, 5000);

      return {
        id: fileId,
        name: file.name,
        type: file.type.split('/').pop(),
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        uploaded: 'Just now'
      };
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
    <div className="document-list bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 flex items-center">
          <FiFileText className="mr-2 text-blue-500 dark:text-blue-400" />
          Your Documents
        </h3>
        <button
          onClick={() => setShowDocuments(false)}
          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Hide documents"
        >
          <FiX className="w-4 h-4 text-gray-500 dark:text-gray-300" />
        </button>
      </div>
      
      <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className={`document-preview flex items-center p-3 cursor-pointer rounded-lg transition-all duration-200 ${
              activeDocument?.id === doc.id 
                ? 'bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-400 dark:border-blue-500 shadow-sm' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-l-4 border-transparent'
            }`}
            onClick={() => handleDocumentSelect(doc)}
          >
            <div className="document-preview-icon mr-3">
              <FiFileText className="w-5 h-5 text-gray-700 dark:text-gray-200" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {doc.name}
              </p>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-800 dark:text-gray-200 mr-2">
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
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => setShowDocuments(true)}
            className="md:hidden mr-2 p-1 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Show documents"
          >
            <FiMenu className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {activeDocument ? activeDocument.name : 'New Chat'}
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleClearChat}
            className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            title="New chat"
          >
            <FiMessageSquare className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowDocuments(!showDocuments)}
            className="hidden md:flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <FiFileText className="w-4 h-4" />
            <span>Documents</span>
          </button>
        </div>
      </div>
      
      {/* Messages container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-blue-50 dark:bg-gray-950"
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
            <div className="flex items-center space-x-2 p-3 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
              <div className="typing-indicator">
                <div className="typing-dot bg-blue-400"></div>
                <div className="typing-dot bg-blue-400"></div>
                <div className="typing-dot bg-blue-400"></div>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Input area */}
      <div className="border-t border-blue-200 dark:border-gray-800 bg-blue-100 dark:bg-gray-900 p-4 shadow-inner">
        <div className="max-w-3xl mx-auto">
          {uploadStatus && (
            <div className={`mb-4 p-3 rounded-lg ${
              uploadStatus.success === true 
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800' 
                : uploadStatus.success === false 
                  ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800' 
                  : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800'
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
                    <div className="mt-1 w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5">
                      <div 
                        className="bg-teal-400 dark:bg-teal-700 h-1.5 rounded-full transition-all duration-300 ease-out" 
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
                className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-2 pr-12 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-inner"
                rows={1}
                disabled={isLoading}
              />
              <div className="absolute right-2 bottom-2 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading || isUploading}
                  className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-300"
                  title="Attach file"
                >
                  <FiPaperclip className="w-5 h-5" />
                </button>
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={`p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                    !input.trim() || isLoading
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all'
                  }`}
                  title="Send message"
                >
                  <FiSend className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
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
    <div className="flex h-screen bg-blue-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      {/* App Title */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-md dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold text-center">IntelliChat</h1>
        </div>
      </div>
      {/* Sidebar - Desktop */}
      <div className={`hidden md:flex md:flex-shrink-0 w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col h-full ${showDocuments ? 'flex' : 'hidden'}`}>
        {renderDocumentList()}
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden pt-12">
        {renderChatInterface()}
      </div>
      
      {/* Mobile sidebar overlay */}
      {showDocuments && (
        <div className="md:hidden fixed inset-0 z-40">
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black dark:bg-opacity-70 transition-opacity"
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
