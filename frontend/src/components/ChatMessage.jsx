import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'prism-react-renderer';
import { FiUser, FiMessageSquare, FiAlertCircle } from 'react-icons/fi';

const ChatMessage = ({ message }) => {
  const { role, content } = message;

  const getMessageStyles = () => {
    const baseStyles = 'rounded-2xl p-4 max-w-[75%] shadow-lg transition-all duration-200 text-base';
    switch (role) {
      case 'user':
        return {
          container: `${baseStyles} bg-blue-600 text-white ml-auto rounded-br-md border border-blue-200`,
          label: 'text-xs font-semibold text-blue-100 mb-1 text-right',
        };
      case 'assistant':
        return {
          container: `${baseStyles} bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 mr-auto rounded-bl-md border border-gray-200 dark:border-gray-700`,
          label: 'text-xs font-semibold text-blue-500 dark:text-blue-300 mb-1',
        };
      case 'system':
        return {
          container: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 mx-auto max-w-xl text-center italic py-2 px-4 my-4 rounded-lg',
          label: '',
        };
      default:
        return {
          container: `${baseStyles} bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100`,
          label: '',
        };
    }
  };

  const styles = getMessageStyles();
  const isUser = role === 'user';
  const isAssistant = role === 'assistant';

  return (
    <div className={`flex ${isUser ? 'justify-end' : isAssistant ? 'justify-start' : 'justify-center'} mb-6 px-2`}>  
      <div className={styles.container}>
        {role !== 'system' && (
          <div className={styles.label}>
            {role === 'user' ? 'You' : 'Assistant'}
          </div>
        )}
        <div>
          <ReactMarkdown
            className="prose dark:prose-invert prose-sm max-w-none"
            components={{
              // Code blocks with syntax highlighting
              code({node, inline, className, children, ...props}) {
                const match = /language-(\w+)/.exec(className || '');
                
                return !inline && match ? (
                  <div className="rounded-lg overflow-hidden my-2">
                    <div className="bg-gray-100 dark:bg-gray-800 px-4 py-1 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                      {match[1]}
                    </div>
                    <SyntaxHighlighter
                      language={match[1]}
                      style={null}
                      customStyle={{
                        margin: 0,
                        padding: '1rem',
                        fontSize: '0.875rem',
                        lineHeight: '1.5',
                        backgroundColor: 'rgb(243, 244, 246)',
                        color: 'rgb(17, 24, 39)'
                      }}
                      className="dark:!bg-gray-900"
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <code className="bg-gray-100 dark:bg-gray-700 rounded px-1.5 py-0.5 text-sm font-mono">
                    {children}
                  </code>
                );
              },
              // Links
              a: ({node, ...props}) => (
                <a
                  className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                  {...props}
                />
              ),
              // Blockquotes
              blockquote: ({node, ...props}) => (
                <blockquote 
                  className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-2 text-gray-600 dark:text-gray-300"
                  {...props}
                />
              ),
              // Lists
              ul: ({node, ...props}) => (
                <ul className="list-disc pl-5 space-y-1 my-2" {...props} />
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
