import React from "react";
import ReactMarkdown from "react-markdown";

const ChatMessage = ({ message }) => {
  const { role, content } = message;

  // Define styles based on message role
  const getMessageStyles = () => {
    switch (role) {
      case "user":
        return "bg-primary-100 text-gray-800 dark:bg-primary-900 dark:text-gray-100 ml-auto";
      case "assistant":
        return "bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-100 mr-auto";
      case "system":
        return "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 mx-auto italic";
      default:
        return "bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
  };

  return (
    <div className={`rounded-lg p-4 max-w-[80%] shadow ${getMessageStyles()}`}>
      {role === "system" ? (
        <div className="text-center">{content}</div>
      ) : (
        <div>
          <div className="font-semibold mb-1 text-xs uppercase">
            {role === "user" ? "You" : "Assistant"}
          </div>
          <ReactMarkdown
            className="prose dark:prose-invert prose-sm max-w-none"
            components={{
              // Style code blocks and inline code
              code: ({ node, inline, className, children, ...props }) => {
                return (
                  <code
                    className={`${
                      inline
                        ? "bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded"
                        : "block bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto"
                    } ${className || ""}`}
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              // Style links
              a: ({ node, className, children, ...props }) => (
                <a
                  className="text-primary-600 dark:text-primary-400 hover:underline"
                  {...props}
                >
                  {children}
                </a>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
