'use client'

import React from 'react'
import { Bot, User, AlertCircle, Loader2 } from 'lucide-react'
import { ChatMessage } from '@/types/gpt'

interface GPTMessageBubbleProps {
  message: ChatMessage;
  avatar?: string;
}

const GPTMessageBubble: React.FC<GPTMessageBubbleProps> = ({ 
  message,
  avatar
}) => {
  const isUser = message.role === 'user';
  const isError = message.error;
  const isLoading = message.isLoading;
  const isFallback = message.isFromFallback;
  
  // Format the timestamp
  const formattedTime = message.timestamp 
    ? message.timestamp.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    : '';
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-start items-end space-x-2 animate-fade-in">
        <div className="flex-shrink-0 mb-2">
          {avatar ? (
            <img src={avatar} alt="AI Avatar" className="h-8 w-8 rounded-full" />
          ) : (
            <Bot className="h-6 w-6 text-green-600" />
          )}
        </div>
        <div className="bg-gray-100 rounded-2xl px-4 py-2 max-w-[80%]">
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
            <div 
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
              style={{ animationDelay: '0.2s' }} 
            />
            <div 
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
              style={{ animationDelay: '0.4s' }} 
            />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-end space-x-2 mb-4 animate-fade-in`}
    >
      {!isUser && (
        <div className="flex-shrink-0 mb-2">
          {avatar ? (
            <img src={avatar} alt="AI Avatar" className="h-8 w-8 rounded-full" />
          ) : (
            <Bot className={`h-6 w-6 ${isFallback ? 'text-amber-500' : 'text-green-600'}`} />
          )}
        </div>
      )}
      
      <div
        className={`rounded-2xl px-4 py-2 max-w-[80%] ${
          isUser
            ? 'bg-green-600 text-white'
            : isError
            ? 'bg-red-50 text-red-800 border border-red-200'
            : isFallback
            ? 'bg-amber-50 text-gray-900 border border-amber-200'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        {isError && (
          <div className="flex items-center mb-1 text-red-600">
            <AlertCircle size={16} className="mr-1" />
            <span className="text-sm font-medium">Error</span>
          </div>
        )}
        
        <p className="whitespace-pre-wrap">{message.content}</p>
        
        <div className="text-xs opacity-70 mt-1 block flex items-center justify-between">
          <span>{formattedTime}</span>
          {isFallback && !isUser && !isError && (
            <span className="text-amber-600 text-[10px] ml-2">basic mode</span>
          )}
        </div>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 mb-2">
          <User className="h-6 w-6 text-green-600" />
        </div>
      )}
    </div>
  );
};

export default GPTMessageBubble; 