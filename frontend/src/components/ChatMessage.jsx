import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'prism-react-renderer';
import { FiUser, FiMessageSquare, FiAlertCircle, FiInfo } from 'react-icons/fi';

// Default theme for code blocks
const defaultTheme = {
  plain: {
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  styles: [
    {
      types: ['comment', 'prolog', 'doctype', 'cdata'],
      style: {
        color: '#6B7280',
        fontStyle: 'italic',
      },
    },
    {
      types: ['punctuation'],
      style: {
        color: '#6B7280',
      },
    },
    {
      types: ['property', 'tag', 'boolean', 'number', 'constant', 'symbol', 'deleted'],
      style: {
        color: '#8B5CF6',
      },
    },
    {
      types: ['selector', 'attr-name', 'string', 'char', 'builtin', 'inserted'],
      style: {
        color: '#059669',
      },
    },
    {
      types: ['operator', 'entity', 'url', 'variable'],
      style: {
        color: '#D97706',
      },
    },
    {
      types: ['atrule', 'attr-value', 'keyword'],
      style: {
        color: '#2563EB',
      },
    },
    {
      types: ['function', 'class-name'],
      style: {
        color: '#DC2626',
      },
    },
  ],
};

const ChatMessage = ({ message }) => {
  const { role, content } = message;

  const getMessageStyles = () => {
    const baseStyles = 'p-4 max-w-[80%] text-base transition-all duration-200';
    switch (role) {
      case 'user':
        return {
          container: `${baseStyles} bg-blue-50 text-gray-800 ml-auto rounded-r-lg rounded-tl-lg border-l-4 border-blue-400 shadow-sm hover:shadow-md`,
          label: 'text-xs font-medium text-blue-600 mb-1 text-right',
          icon: <FiUser className="text-blue-500" />
        };
      case 'assistant':
        return {
          container: `${baseStyles} bg-white text-gray-800 mr-auto rounded-l-lg rounded-tr-lg border-l-4 border-gray-300 shadow-sm hover:shadow-md`,
          label: 'text-xs font-medium text-gray-600 mb-1',
          icon: <FiMessageSquare className="text-gray-500" />
        };
      case 'system':
        return {
          container: 'bg-amber-50 text-amber-800 mx-auto max-w-xl text-center py-2 px-4 my-4 rounded-lg border-l-4 border-amber-400',
          label: '',
          icon: <FiInfo className="text-amber-500" />
        };
      default:
        return {
          container: `${baseStyles} bg-white text-gray-800 border-l-4 border-gray-200`,
          label: 'text-xs font-medium text-gray-500',
          icon: <FiMessageSquare className="text-gray-400" />
        };
    }
  };

  const styles = getMessageStyles();
  const isUser = role === 'user';
  const isAssistant = role === 'assistant';

  return (
    <div className={`mb-4 flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className="flex flex-col max-w-[90%] w-full">
        <div className="flex items-center mb-1">
          <div className="mr-2">
            {styles.icon}
          </div>
          {styles.label && (
            <div className={styles.label}>
              {role === 'user' ? 'You' : role === 'assistant' ? 'Assistant' : 'System'}
            </div>
          )}
        </div>
        <div className={styles.container}>
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline ? (
                  <div className="rounded-lg overflow-hidden my-2 border border-gray-200">
                    <div className="bg-gray-100 px-3 py-1 text-xs text-gray-600 border-b border-gray-200">
                      {match?.[1] || 'code'}
                    </div>
                    <SyntaxHighlighter
                      style={defaultTheme}
                      language={match?.[1]}
                      PreTag="div"
                      className="!m-0 !p-4 overflow-auto !bg-gray-50"
                      customStyle={{
                        margin: 0,
                        fontSize: '0.875rem',
                        lineHeight: '1.5',
                      }}
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <code className="bg-gray-100 text-pink-600 px-1.5 py-0.5 rounded text-sm font-mono">
                    {children}
                  </code>
                );
              },
              a: ({ node, ...props }) => (
                <a
                  {...props}
                  className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              ),
              p: ({ node, ...props }) => (
                <p {...props} className="mb-4 last:mb-0 leading-relaxed" />
              ),
              ul: ({ node, ...props }) => (
                <ul {...props} className="list-disc pl-5 space-y-1 my-2" />
              ),
              ol: ({node, ...props}) => (
                <ol className="list-decimal pl-5 space-y-1 my-2" {...props} />
              ),
              // Headings
              h1: ({node, ...props}) => (
                <h1 className="text-2xl font-bold my-3" {...props} />
              ),
              h2: ({node, ...props}) => (
                <h2 className="text-xl font-bold my-2.5" {...props} />
              ),
              h3: ({node, ...props}) => (
                <h3 className="text-lg font-semibold my-2" {...props} />
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ChatMessage);
