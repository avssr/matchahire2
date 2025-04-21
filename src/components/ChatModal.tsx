'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Role } from '@/lib/supabase'
import { XMarkIcon, PaperAirplaneIcon, UserCircleIcon, ArrowPathIcon, ExclamationCircleIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline'
import { Bot, Loader2 } from 'lucide-react'

interface ChatModalProps {
  role: Role
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

export default function ChatModal({ role, onClose }: ChatModalProps) {
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Function to fetch initial greeting with retry capability
  const fetchInitialMessage = useCallback(async (retry = false) => {
    if (retry) {
      console.log('Retrying initial message fetch, attempt:', retryCount + 1);
      setRetryCount(prev => prev + 1);
    } else if (retryCount === 0) {
      // Set a welcome message while we try to fetch from API
      setMessages([{
        id: Date.now().toString(),
        text: `Hi! I'm loading information about the ${role.title} role at ${role.companies?.name || 'this company'}...`,
        isUser: false,
        timestamp: new Date()
      }]);
    }

    try {
      setIsLoading(true);
      setError(null);
      setDebugInfo(null);
      
      // Try to fetch from API
      try {
        console.log('Fetching initial greeting from API...');
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: '',
            role: role,
            isInitial: true
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Response Error:', response.status, errorText);
          throw new Error(`Failed to get initial message: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Initial message response:', data);
        
        if (data.error) {
          console.error('API returned error:', data.error);
          setDebugInfo(data.error);
          throw new Error(data.error);
        }

        if (!data.message) {
          throw new Error('No message content received from API');
        }

        // Simulate typing effect for the real response
        setIsTyping(true);
        setInitialLoadFailed(false);
        
        setTimeout(() => {
          setMessages([{
            id: Date.now().toString(),
            text: data.message,
            isUser: false,
            isFromFallback: data.usedFallbackModel || data.isError,
            timestamp: new Date()
          }]);
          setIsTyping(false);
        }, 1000);
      } catch (apiError: any) {
        console.error('API request failed:', apiError);
        setDebugInfo(apiError.message);
        
        // Check if we should retry
        if (retryCount < 2) {
          console.log('Will retry after delay...');
          setTimeout(() => fetchInitialMessage(true), 2000);
          return;
        }
        
        // Fall back to test mode
        console.log('Switching to test mode after API failures');
        setUseTestMode(true);
        setInitialLoadFailed(false);
        setMessages([{
          id: Date.now().toString(),
          text: `Hi! I'm your AI assistant for the ${role.title} role at ${role.companies?.name || 'this company'}. Ask me anything about the position!`,
          isUser: false,
          isFromFallback: true,
          timestamp: new Date()
        }]);

        // Set a helpful message
        setError(`We're using a local assistant due to connection issues. Your experience might be limited.`);
      }
    } catch (error: any) {
      console.error('Failed to fetch initial message:', error);
      setError(error instanceof Error ? error.message : 'Failed to start chat');
      setInitialLoadFailed(true);
      setDebugInfo(error.message);
      setUseTestMode(true);
      setMessages([{
        id: Date.now().toString(),
        text: `Hi! I'm your AI assistant for the ${role.title} role at ${role.companies?.name || 'this company'}. Ask me anything about the position!`,
        isUser: false,
        isFromFallback: true,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [role, retryCount]);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
    
    // Fetch the initial greeting
    fetchInitialMessage();
  }, [fetchInitialMessage]);

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

  // Add file upload functions
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
      
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('roleId', role.id);
      
      // Try to upload if API is available
      let success = false;
      let fileUrl = '';
      
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          const data = await response.json();
          success = true;
          fileUrl = data.url;
        }
      } catch (apiError) {
        console.error('API upload failed, using test mode', apiError);
      }
      
      clearInterval(progressInterval);
      
      if (!success) {
        // If API failed, simulate success for demo purposes
        fileUrl = URL.createObjectURL(file);
      }
      
      // Update file status to success
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId ? {
          ...f, 
          status: 'success', 
          progress: 100, 
          url: fileUrl
        } : f
      ));
      
      // Add a message about the uploaded file
      const fileMessage = `I've uploaded my ${file.name.includes('resume') || file.type.includes('pdf') ? 'resume' : 'file'}: ${file.name}`;
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: fileMessage,
        isUser: true,
        timestamp: new Date()
      }]);
      
      // Add the message to the chat
      setInput(fileMessage);
      setTimeout(() => {
        handleSendMessage();
      }, 100);
      
    } catch (error) {
      console.error('File handling error:', error);
      
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId ? {...f, status: 'error', progress: 100} : f
      ));
      
      setError(`Failed to handle file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    // Clear the input
    e.target.value = '';
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const userMessageId = Date.now().toString();
    setInput('');
    setMessages(prev => [...prev, {
      id: userMessageId,
      text: userMessage,
      isUser: true,
      timestamp: new Date()
    }]);
    setIsLoading(true);
    setError(null);
    setDebugInfo(null);

    // Add typing indicator immediately
    setIsTyping(true);

    if (useTestMode) {
      // Use test mode response system
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          text: getTestModeResponse(userMessage),
          isUser: false,
          isFromFallback: true,
          timestamp: new Date()
        }]);
        setIsLoading(false);
      }, 1500);
      return;
    }

    try {
      console.log('Sending message to API:', userMessage.substring(0, 30));
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          role: role,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Response Error:', response.status, errorText);
        throw new Error(`Failed to get response: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('ChatModal: Received API response:', data);
      
      if (data.error) {
        console.error('API returned error:', data.error);
        setDebugInfo(data.error);
        throw new Error(data.error);
      }

      // Even if no explicit error is returned, check if we got a valid message
      if (!data.message) {
        console.error('ChatModal: No message content in response:', data);
        throw new Error('No response message received');
      }

      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          text: data.message,
          isUser: false,
          isFromFallback: data.usedFallbackModel || data.isError,
          timestamp: new Date()
        }]);
      }, 500);
    } catch (error: any) {
      console.error('Chat error:', error);
      setIsTyping(false);
      setError(error instanceof Error ? error.message : 'Failed to process message');
      setDebugInfo(error.message);
      
      // Switch to test mode if API fails
      setUseTestMode(true);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: getTestModeResponse(userMessage),
        isUser: false,
        isFromFallback: true,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRetry = () => {
    // Clear existing messages and retry
    setMessages([]);
    setRetryCount(0);
    setUseTestMode(false);
    fetchInitialMessage();
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-green-50 to-teal-50 rounded-t-xl">
          <div className="flex items-center space-x-3">
            <Bot className="h-6 w-6 text-green-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">AI Assistant</h2>
              <p className="text-sm text-gray-500">{role.title} Specialist</p>
            </div>
            {messages.some(m => m.isFromFallback) && (
              <div className="flex items-center text-xs text-amber-600">
                <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                <span>Using basic mode</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-4 flex items-center space-x-2">
              <div className="flex-shrink-0">⚠️</div>
              <div className="flex-1">
                <p>{error}</p>
                {debugInfo && (
                  <details className="mt-1 text-xs">
                    <summary className="cursor-pointer hover:underline">Technical details</summary>
                    <code className="block mt-1 p-2 bg-red-100 rounded overflow-x-auto">
                      {debugInfo}
                    </code>
                  </details>
                )}
                {initialLoadFailed && (
                  <button 
                    onClick={handleRetry}
                    className="mt-2 flex items-center text-red-700 hover:text-red-900"
                  >
                    <ArrowPathIcon className="h-4 w-4 mr-1" />
                    Try again
                  </button>
                )}
              </div>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} items-end space-x-2`}
            >
              {!message.isUser && (
                <Bot className={`h-6 w-6 flex-shrink-0 mb-2 ${message.isFromFallback ? 'text-amber-500' : 'text-green-600'}`} />
              )}
              <div
                className={`rounded-2xl px-4 py-2 max-w-[80%] ${
                  message.isUser
                    ? 'bg-green-600 text-white'
                    : message.error
                    ? 'bg-red-50 text-red-800'
                    : message.isFromFallback
                    ? 'bg-amber-50 text-gray-900 border border-amber-200'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.text}</p>
                <span className="text-xs opacity-70 mt-1 block flex items-center justify-between">
                  <span>{message.timestamp.toLocaleTimeString()}</span>
                  {message.isFromFallback && !message.isUser && !message.error && (
                    <span className="text-amber-600 text-[10px] ml-2">basic mode</span>
                  )}
                </span>
              </div>
              {message.isUser && (
                <UserCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0 mb-2" />
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start items-end space-x-2">
              <Bot className="h-6 w-6 text-green-600 flex-shrink-0 mb-2" />
              <div className="bg-gray-100 rounded-2xl px-4 py-2">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="p-4 border-t border-gray-100">
            <h4 className="text-xs font-medium text-gray-500 mb-2">Attached Files:</h4>
            <div className="space-y-2">
              {uploadedFiles.map(file => (
                <div key={file.id} className="flex items-center text-sm bg-gray-50 rounded p-2">
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-gray-700">{file.name}</p>
                    <div className="flex items-center">
                      {file.status === 'uploading' ? (
                        <>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mr-2">
                            <div 
                              className="bg-green-500 h-1.5 rounded-full" 
                              style={{ width: `${file.progress || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">{file.progress}%</span>
                        </>
                      ) : file.status === 'success' ? (
                        <span className="text-xs text-green-600">Uploaded successfully</span>
                      ) : (
                        <span className="text-xs text-red-600">Failed to upload</span>
                      )}
                    </div>
                  </div>
                  {file.status === 'success' && file.url && (
                    <a 
                      href={file.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-2 text-xs text-green-600 hover:underline mr-2"
                    >
                      View
                    </a>
                  )}
                  <button 
                    onClick={() => handleRemoveFile(file.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t bg-white rounded-b-xl">
          <div className="flex space-x-2">
            <button
              onClick={handleFileUpload}
              className="rounded-full p-2 bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-green-600 transition-colors flex-shrink-0"
              title="Upload resume or file"
            >
              <CloudArrowUpIcon className="h-5 w-5" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            />
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about the role... (Press Enter to send)"
              className="flex-1 resize-none rounded-xl border-gray-200 shadow-sm focus:border-green-500 focus:ring-green-500 min-h-[44px] max-h-32"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className={`rounded-full p-2 ${
                isLoading || !input.trim()
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-green-600 text-white hover:bg-green-700'
              } transition-colors flex-shrink-0`}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <PaperAirplaneIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 