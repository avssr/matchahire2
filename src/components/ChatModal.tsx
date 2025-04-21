'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Role, Persona } from '@/types/gpt'
import { XMarkIcon, PaperAirplaneIcon, UserCircleIcon, ArrowPathIcon, ExclamationCircleIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline'
import { Bot, Loader2 } from 'lucide-react'
import { RoleService } from '@/utils/apiService'
import { logger } from '@/utils/logger'

interface ChatModalProps {
  role: Role
  sessionId: string
  onClose: () => void
}

interface Message {
  id: string
  text: string
  isUser: boolean
  error?: boolean
  isFromFallback?: boolean
  timestamp: Date
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: 'uploading' | 'success' | 'error';
  progress?: number;
  url?: string;
}

// Test mode responses for when API is not available
const TEST_RESPONSES: Record<string, string> = {
  default: "I'm an AI assistant to help with your questions about this role. How can I help you today?",
  requirements: "This role requires experience with the following skills:\n\n- Strong communication skills\n- Problem-solving abilities\n- Teamwork and collaboration\n- Technical expertise in the relevant field\n\nDo you have experience with these requirements?",
  salary: "The salary for this position is competitive and based on experience. The typical range for this role in this location is between $80,000 and $120,000 per year, plus benefits.",
  application: "To apply for this role, you can use the 'Quick Apply' button on the role card. You'll need to submit your resume and some basic information.",
  company: "This company is known for its innovative approach and great work culture. They offer competitive benefits and opportunities for professional growth.",
  interview: "The interview process typically includes an initial screening, a technical assessment, and one or more interviews with the team and leadership."
};

export default function ChatModal({ role, sessionId, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [initialLoadFailed, setInitialLoadFailed] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [useTestMode, setUseTestMode] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [persona, setPersona] = useState<Persona | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Function to fetch initial persona and greet
  const fetchInitialData = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Set a welcome message while loading
      setMessages([{
        id: Date.now().toString(),
        text: `Hi! I'm loading information about the ${role.title} role at ${role.companies?.name || 'this company'}...`,
        isUser: false,
        timestamp: new Date()
      }])
      
      // Fetch persona for the role
      const personaResponse = await RoleService.getPersonaByRoleId(role.id)
      
      if (!personaResponse.success || !personaResponse.data) {
        throw new Error(personaResponse.error || 'Failed to fetch persona data')
      }
      
      setPersona(personaResponse.data)
      
      // Get initial AI message
      try {
        const response = await RoleService.sendChatMessage(sessionId, '')
        
        if (!response.success) {
          throw new Error(response.error || 'Failed to get initial message')
        }
        
        setMessages([{
          id: Date.now().toString(),
          text: response?.data?.reply || "I couldn't generate a response. Please try again.",
          isUser: false,
          timestamp: new Date()
        }])
      } catch (error) {
        logger.error('Error fetching initial greeting', error)
        
        // Fall back to test mode
        setUseTestMode(true)
        
        setMessages([{
          id: Date.now().toString(),
          text: `Hi, I'm ${personaResponse.data.name || 'an AI assistant'} for the ${role.title} role. Ask me anything about the position!`,
          isUser: false,
          isFromFallback: true,
          timestamp: new Date()
        }])
      }
    } catch (error) {
      logger.error('Failed to fetch initial data', error)
      setError(error instanceof Error ? error.message : 'Failed to start chat')
      setInitialLoadFailed(true)
      
      // Fall back to test mode
      setUseTestMode(true)
      setMessages([{
        id: Date.now().toString(),
        text: `Hi! I'm an AI assistant for the ${role.title} position. How can I help you today?`,
        isUser: false,
        isFromFallback: true,
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
  }, [role, sessionId])

  useEffect(() => {
    // Focus input and fetch initial greeting
    inputRef.current?.focus()
    fetchInitialData()
  }, [fetchInitialData])

  // Get a response from the test mode system
  const getTestModeResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('requirements') || lowerMessage.includes('qualifications') || lowerMessage.includes('skills')) {
      return TEST_RESPONSES.requirements;
    } else if (lowerMessage.includes('salary') || lowerMessage.includes('pay') || lowerMessage.includes('compensation')) {
      return TEST_RESPONSES.salary;
    } else if (lowerMessage.includes('apply') || lowerMessage.includes('application') || lowerMessage.includes('submit')) {
      return TEST_RESPONSES.application;
    } else if (lowerMessage.includes('company') || lowerMessage.includes('culture') || lowerMessage.includes('benefits')) {
      return TEST_RESPONSES.company;
    } else if (lowerMessage.includes('interview') || lowerMessage.includes('process') || lowerMessage.includes('hiring')) {
      return TEST_RESPONSES.interview;
    } else {
      return `Thanks for your question about ${userMessage.substring(0, 30)}... As a ${role.title}, you would be working with ${role.tags?.join(', ') || 'various technologies and tools'}. Is there something specific about this role you'd like to know?`;
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0]; // Just handle one file for simplicity
    
    // Create a unique ID for this upload
    const fileId = `file-${Date.now()}`;
    
    // Add file to state with uploading status
    setUploadedFiles(prev => [...prev, {
      id: fileId,
      name: file.name,
      size: file.size,
      status: 'uploading',
      progress: 0
    }]);
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileId ? {...f, progress: Math.min((f.progress || 0) + 10, 90)} : f
        ));
      }, 300);
      
      // The actual upload will go here in a real implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      clearInterval(progressInterval);
      
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId ? {
          ...f, 
          status: 'success',
          progress: 100,
          url: URL.createObjectURL(file)
        } : f
      ));
      
      // Add a message about the upload
      const userMessage: Message = {
        id: Date.now().toString(),
        text: `I've uploaded my resume: ${file.name}`,
        isUser: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Have the AI respond to the upload
      setIsTyping(true);
      
      setTimeout(() => {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: `Thank you for uploading your resume. I'll review it to provide more personalized feedback about how your experience aligns with the ${role.title} role.`,
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botResponse]);
        setIsTyping(false);
      }, 1500);
      
    } catch (error) {
      logger.error('File upload failed:', error);
      
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId ? {
          ...f, 
          status: 'error',
          error: 'Upload failed'
        } : f
      ));
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const trimmedInput = input.trim();
    setInput('');
    
    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      text: trimmedInput,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    try {
      if (useTestMode) {
        // Add a slight delay for more natural conversation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: getTestModeResponse(trimmedInput),
          isUser: false,
          isFromFallback: true,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botResponse]);
      } else {
        // Use our API service to send the message
        const response = await RoleService.sendChatMessage(
          sessionId, 
          trimmedInput
        );
        
        if (!response.success) {
          logger.error('Failed to get response from API service:', response.error);
          throw new Error(response.error || 'Failed to get response');
        }
        
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: response?.data?.reply || "I'm sorry, I couldn't generate a response. Please try again.",
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botResponse]);
      }
    } catch (error) {
      logger.error('Failed to send chat message:', error);
      
      // If API fails, fall back to test mode
      setUseTestMode(true);
      
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting to my knowledge base. I'll switch to a basic mode to help you.",
        isUser: false,
        isFromFallback: true,
        error: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorResponse]);
      
      // Add the fallback response after the error message
      setTimeout(() => {
        const fallbackResponse: Message = {
          id: (Date.now() + 2).toString(),
          text: getTestModeResponse(trimmedInput),
          isUser: false,
          isFromFallback: true,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, fallbackResponse]);
      }, 1000);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRetry = () => {
    setRetryCount(0);
    setInitialLoadFailed(false);
    setUseTestMode(false);
    setError(null);
    setMessages([]);
    fetchInitialData();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal content */}
      <div className="relative z-50 w-full max-w-3xl mx-4 h-[80vh] bg-white rounded-xl shadow-xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-green-50 to-teal-50 rounded-t-xl">
          <div className="flex items-center space-x-3">
            {persona?.avatar_url ? (
              <img 
                src={persona?.avatar_url || '/default-avatar.png'} 
                alt={persona?.name || 'AI Assistant'} 
                className="h-10 w-10 rounded-full border-2 border-white shadow-sm"
              />
            ) : (
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <Bot className="h-6 w-6 text-green-600" />
              </div>
            )}
            
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {persona?.name || 'AI Assistant'}
              </h2>
              <p className="text-sm text-gray-500">
                {role.title} Specialist
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {initialLoadFailed && (
              <button
                onClick={handleRetry}
                className="flex items-center text-amber-600 hover:text-amber-700"
                aria-label="Retry connection"
              >
                <ArrowPathIcon className="h-5 w-5" />
              </button>
            )}
            
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close chat"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        {/* Main chat area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-lg flex items-start">
              <ExclamationCircleIcon className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Error connecting to AI</p>
                <p className="text-sm">{error}</p>
                {debugInfo && (
                  <details className="mt-1">
                    <summary className="text-xs cursor-pointer">Technical details</summary>
                    <pre className="text-xs mt-1 p-2 bg-red-100 rounded overflow-auto max-h-40">{debugInfo}</pre>
                  </details>
                )}
              </div>
            </div>
          )}
          
          {/* Messages */}
          {messages.map(message => (
            <div 
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}
            >
              {!message.isUser && (
                <div className="flex-shrink-0 mr-2">
                  {persona?.avatar_url ? (
                    <img 
                      src={persona?.avatar_url || '/default-avatar.png'} 
                      alt={persona?.name || 'AI'} 
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Bot className="h-5 w-5 text-green-600" />
                    </div>
                  )}
                </div>
              )}
              
              <div 
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  message.isUser 
                    ? 'bg-green-600 text-white'
                    : message.error
                    ? 'bg-red-50 text-red-800 border border-red-200'
                    : message.isFromFallback
                    ? 'bg-yellow-50 text-gray-800 border border-yellow-200'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.text}</p>
                <div className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'})}
                  {message.isFromFallback && !message.isUser && !message.error && (
                    <span className="ml-2 text-amber-500 text-[10px]">basic mode</span>
                  )}
                </div>
              </div>
              
              {message.isUser && (
                <div className="flex-shrink-0 ml-2">
                  <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <UserCircleIcon className="h-5 w-5 text-gray-500" />
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start mb-4">
              <div className="flex-shrink-0 mr-2">
                {persona?.avatar_url ? (
                  <img 
                    src={persona?.avatar_url || '/default-avatar.png'} 
                    alt={persona?.name || 'AI'} 
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Bot className="h-5 w-5 text-green-600" />
                  </div>
                )}
              </div>
              
              <div className="bg-white text-gray-400 rounded-lg px-4 py-3 border border-gray-200">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          )}
          
          {/* Anchor for auto-scroll */}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Upload files area */}
        {uploadedFiles.length > 0 && (
          <div className="border-t p-2 bg-gray-50">
            <div className="flex flex-wrap gap-2">
              {uploadedFiles.map(file => (
                <div 
                  key={file.id} 
                  className="flex items-center bg-white rounded-full px-3 py-1 text-sm border border-gray-200"
                >
                  <span className="truncate max-w-[150px]">{file.name}</span>
                  
                  {file.status === 'uploading' && (
                    <div className="ml-2 h-4 w-4">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    </div>
                  )}
                  
                  <button
                    onClick={() => handleRemoveFile(file.id)}
                    className="ml-2 text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Input area */}
        <div className="p-4 border-t bg-white">
          <div className="relative flex items-center">
            <button
              onClick={handleFileUpload}
              className="absolute left-3 text-gray-400 hover:text-gray-600"
              aria-label="Upload file"
              type="button"
            >
              <CloudArrowUpIcon className="h-5 w-5" />
            </button>
            
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              rows={1}
              className="w-full bg-gray-100 rounded-full py-2 pl-10 pr-12 resize-none max-h-24 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white"
            />
            
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className={`absolute right-3 ${
                input.trim() && !isLoading 
                  ? 'text-green-600 hover:text-green-700'
                  : 'text-gray-300'
              }`}
              aria-label="Send message"
              type="button"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt"
          />
          
          <p className="text-xs text-gray-500 mt-2 text-center">
            {useTestMode ? 
              'Using basic mode. Responses may be limited.' : 
              'Connected to AI assistant. Ask any questions about this role.'}
          </p>
        </div>
      </div>
    </div>
  );
} 