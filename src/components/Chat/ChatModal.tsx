'use client'

import React, { useState, useEffect, useRef, useReducer, useCallback } from 'react'
import { XMarkIcon, PaperAirplaneIcon, ArrowPathIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { Bot, Loader2, User, AlertCircle } from 'lucide-react'
import { Role } from '@/lib/supabase'
import GPTMessageBubble from './GPTMessageBubble'
import ProgressBar from './ProgressBar'
import UploadAsset from './UploadAsset'
import { ChatMessage, GPTEvaluation, QnAPair, UploadedAsset } from '@/types/gpt'
import { ChatSessionState, ChatSessionAction } from '@/types/chatSession'
import { uploadFile } from '@/utils/fileUpload'

interface ChatModalProps {
  role: Role;
  onClose: () => void;
}

// Initial state for chat session
const initialState: ChatSessionState = {
  sessionId: Date.now().toString(),
  roleId: '',
  role: null,
  company: null,
  persona: null,
  messages: [],
  questions: [],
  answers: [],
  currentQuestion: null,
  isLoading: false,
  isTyping: false,
  error: null,
  uploadedAssets: [],
  questionIndex: 0,
  progressPercentage: 0,
  interviewComplete: false,
  showSummary: false,
  fitScore: null,
  summaryCandidate: null,
  summaryRecruiter: null,
  candidateName: null,
  candidateEmail: null,
  useTestMode: false,
  hasApiError: false,
  initialLoadFailed: false,
  retryCount: 0
};

// Reducer function for managing chat state
function chatReducer(state: ChatSessionState, action: ChatSessionAction): ChatSessionState {
  switch (action.type) {
    case 'SET_ROLE_DATA':
      return {
        ...state,
        role: action.payload.role,
        company: action.payload.company,
        roleId: action.payload.role.id
      };
      
    case 'SET_PERSONA':
      const questions = action.payload.question_sequence?.questions || [];
      return {
        ...state,
        persona: action.payload,
        questions,
        currentQuestion: questions.length > 0 ? questions[0].text : null
      };
      
    case 'ADD_USER_MESSAGE':
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: action.payload,
        timestamp: new Date()
      };
      return {
        ...state,
        messages: [...state.messages, userMessage]
      };
      
    case 'ADD_ASSISTANT_MESSAGE':
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: action.payload,
        timestamp: new Date()
      };
      return {
        ...state,
        messages: [...state.messages, assistantMessage]
      };
      
    case 'SET_TYPING':
      return {
        ...state,
        isTyping: action.payload
      };
      
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
      
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };
      
    case 'ADD_ANSWER':
      return {
        ...state,
        answers: [...state.answers, action.payload]
      };
      
    case 'SET_CURRENT_QUESTION':
      return {
        ...state,
        currentQuestion: action.payload
      };
      
    case 'INCREMENT_QUESTION_INDEX':
      const newIndex = state.questionIndex + 1;
      const total = state.questions.length;
      return {
        ...state,
        questionIndex: newIndex,
        progressPercentage: total > 0 ? Math.round((newIndex / total) * 100) : 0,
        currentQuestion: newIndex < total ? state.questions[newIndex].text : null
      };
      
    case 'SET_INTERVIEW_COMPLETE':
      return {
        ...state,
        interviewComplete: action.payload
      };
      
    case 'SET_SHOW_SUMMARY':
      return {
        ...state,
        showSummary: action.payload
      };
      
    case 'SET_EVALUATION':
      return {
        ...state,
        fitScore: action.payload.fitScore,
        summaryCandidate: action.payload.summaryCandidate,
        summaryRecruiter: action.payload.summaryRecruiter
      };
      
    case 'SET_CANDIDATE_INFO':
      return {
        ...state,
        candidateName: action.payload.name,
        candidateEmail: action.payload.email
      };
      
    case 'ADD_UPLOADED_ASSET':
      return {
        ...state,
        uploadedAssets: [...state.uploadedAssets, action.payload]
      };
      
    case 'UPDATE_UPLOADED_ASSET':
      return {
        ...state,
        uploadedAssets: state.uploadedAssets.map(asset => 
          asset.id === action.payload.id 
            ? { ...asset, ...action.payload.updates } 
            : asset
        )
      };
      
    case 'REMOVE_UPLOADED_ASSET':
      return {
        ...state,
        uploadedAssets: state.uploadedAssets.filter(asset => asset.id !== action.payload)
      };
      
    case 'SET_TEST_MODE':
      return {
        ...state,
        useTestMode: action.payload
      };
      
    case 'SET_API_ERROR':
      return {
        ...state,
        hasApiError: action.payload
      };
      
    case 'INCREMENT_RETRY_COUNT':
      return {
        ...state,
        retryCount: state.retryCount + 1
      };
      
    case 'RESET_SESSION':
      return {
        ...initialState,
        sessionId: Date.now().toString(),
        role: state.role,
        company: state.company,
        persona: state.persona,
        roleId: state.roleId,
        questions: state.questions
      };
      
    default:
      return state;
  }
}

// Test responses for when API is not available
const TEST_RESPONSES: Record<string, string> = {
  default: "I'm an AI assistant to help with your questions about this role. How can I help you today?",
  requirements: "This role requires experience with the following skills:\n\n- Strong communication skills\n- Problem-solving abilities\n- Teamwork and collaboration\n- Technical expertise in the relevant field\n\nDo you have experience with these requirements?",
  salary: "The salary for this position is competitive and based on experience. The typical range for this role in this location is between $80,000 and $120,000 per year, plus benefits.",
  application: "To apply for this role, you can share your resume and we'll review your qualifications. Would you like to upload your resume now?",
  company: "This company is known for its innovative approach and great work culture. They offer competitive benefits and opportunities for professional growth.",
  interview: "The interview process typically includes an initial screening, a technical assessment, and one or more interviews with the team and leadership."
};

export default function ChatModal({ role, onClose }: ChatModalProps) {
  // State management with reducer
  const [state, dispatch] = useReducer(chatReducer, {
    ...initialState,
    roleId: role.id
  });

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Local state
  const [input, setInput] = useState('');
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Effect to scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [state.messages]);

  // Effect to focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  // Effect to fetch role, company, and persona data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Fetch role data from API
        const response = await fetch(`/api/roles/${role.id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch role data: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Set role and company data
        dispatch({ 
          type: 'SET_ROLE_DATA', 
          payload: { 
            role: data.role, 
            company: data.company 
          } 
        });
        
        // Set persona data
        if (data.persona) {
          dispatch({ type: 'SET_PERSONA', payload: data.persona });
        }
        
        // Fetch initial greeting
        await fetchInitialGreeting();
      } catch (error) {
        console.error('Error fetching initial data:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load role data. Please try again.' });
        dispatch({ type: 'SET_TEST_MODE', payload: true });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    
    fetchInitialData();
  }, [role.id]);
  
  // Function to fetch initial greeting
  const fetchInitialGreeting = async (retry = false) => {
    if (retry) {
      dispatch({ type: 'INCREMENT_RETRY_COUNT' });
    } else if (state.retryCount === 0) {
      // Set a welcome message while we try to fetch from API
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Hi! I'm loading information about the ${role.title} role...`,
        timestamp: new Date()
      };
      
      dispatch({ 
        type: 'ADD_ASSISTANT_MESSAGE', 
        payload: `Hi! I'm loading information about the ${role.title} role...` 
      });
    }
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      // Try to fetch from API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: '',
          role_id: role.id,
          isInitial: true
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get initial message: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Simulate typing effect for the real response
      dispatch({ type: 'SET_TYPING', payload: true });
      
      setTimeout(() => {
        dispatch({ 
          type: 'ADD_ASSISTANT_MESSAGE', 
          payload: data.message 
        });
        dispatch({ type: 'SET_TYPING', payload: false });
      }, 1000);
    } catch (error) {
      console.error('Error fetching initial greeting:', error);
      
      // Check if we should retry
      if (state.retryCount < 2) {
        setTimeout(() => fetchInitialGreeting(true), 2000);
        return;
      }
      
      // Fall back to test mode
      dispatch({ type: 'SET_TEST_MODE', payload: true });
      dispatch({ 
        type: 'ADD_ASSISTANT_MESSAGE', 
        payload: `Hello! I'm your AI assistant for the ${role.title} role. Ask me anything about the position!` 
      });
      dispatch({ 
        type: 'SET_ERROR', 
        payload: 'We\'re using a local assistant due to connection issues. Your experience might be limited.' 
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };
  
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

  // Handle file upload
  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };
  
  // Handle file selection
  const handleFileChange = async (file: File) => {
    // Create a unique ID for this upload
    const fileId = `file-${Date.now()}`;
    
    // Add file to state with uploading status
    dispatch({
      type: 'ADD_UPLOADED_ASSET',
      payload: {
        id: fileId,
        type: 'resume',
        name: file.name,
        size: file.size,
        status: 'uploading',
        progress: 0
      }
    });
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        dispatch({
          type: 'UPDATE_UPLOADED_ASSET',
          payload: {
            id: fileId,
            updates: {
              progress: Math.min((state.uploadedAssets.find(a => a.id === fileId)?.progress || 0) + 10, 90)
            }
          }
        });
      }, 300);
      
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('roleId', role.id);
      
      // Try to upload to API
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
        console.error('API upload failed, using local mode', apiError);
      }
      
      clearInterval(progressInterval);
      
      if (!success && state.useTestMode) {
        // If API failed, create a local URL for demo purposes
        fileUrl = URL.createObjectURL(file);
        success = true;
      }
      
      // Update file status
      dispatch({
        type: 'UPDATE_UPLOADED_ASSET',
        payload: {
          id: fileId,
          updates: {
            status: success ? 'success' : 'error',
            progress: 100,
            url: fileUrl,
            error: success ? undefined : 'Failed to upload file'
          }
        }
      });
      
      // Add a message about the uploaded file
      const fileMessage = `I've uploaded my ${file.name.includes('resume') || file.type.includes('pdf') ? 'resume' : 'file'}: ${file.name}`;
      
      dispatch({ type: 'ADD_USER_MESSAGE', payload: fileMessage });
      
      // Process the message through the chat system
      await handleSendMessage(fileMessage);
    } catch (error) {
      console.error('File handling error:', error);
      
      dispatch({
        type: 'UPDATE_UPLOADED_ASSET',
        payload: {
          id: fileId,
          updates: {
            status: 'error',
            progress: 100,
            error: `Failed to handle file: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        }
      });
    }
  };
  
  // Handle removing a file
  const handleRemoveFile = (fileId: string) => {
    dispatch({ type: 'REMOVE_UPLOADED_ASSET', payload: fileId });
  };
  
  // Handle sending a message
  const handleSendMessage = async (messageText?: string) => {
    const message = messageText || input.trim();
    
    if (!message || state.isLoading) return;
    
    // Clear input if not using provided message
    if (!messageText) {
      setInput('');
    }
    
    // Add user message to state
    dispatch({ type: 'ADD_USER_MESSAGE', payload: message });
    
    // Set loading state
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    // Add typing indicator immediately
    dispatch({ type: 'SET_TYPING', payload: true });
    
    if (state.useTestMode) {
      // Use test mode response system
      setTimeout(() => {
        dispatch({ type: 'SET_TYPING', payload: false });
        dispatch({
          type: 'ADD_ASSISTANT_MESSAGE',
          payload: getTestModeResponse(message)
        });
        dispatch({ type: 'SET_LOADING', payload: false });
      }, 1500);
      return;
    }
    
    try {
      // Send message to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          role_id: role.id,
          conversation_history: state.messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get response: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Check if this is potentially a question-answer pair to record
      if (state.currentQuestion && state.messages.length > 0) {
        dispatch({
          type: 'ADD_ANSWER',
          payload: {
            q: state.currentQuestion,
            a: message
          }
        });
        
        dispatch({ type: 'INCREMENT_QUESTION_INDEX' });
      }
      
      // Add response with slight delay for natural feel
      setTimeout(() => {
        dispatch({ type: 'SET_TYPING', payload: false });
        dispatch({
          type: 'ADD_ASSISTANT_MESSAGE',
          payload: data.message
        });
      }, 500);
    } catch (error) {
      console.error('Chat error:', error);
      dispatch({ type: 'SET_TYPING', payload: false });
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to process message'
      });
      
      // Switch to test mode if API fails
      dispatch({ type: 'SET_TEST_MODE', payload: true });
      dispatch({
        type: 'ADD_ASSISTANT_MESSAGE',
        payload: getTestModeResponse(message)
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
      inputRef.current?.focus();
    }
  };
  
  // Handle key press (Enter to send)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Render the component
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-green-50 to-teal-50 rounded-t-xl">
          <div className="flex items-center space-x-3">
            {state.persona?.avatar_url ? (
              <img 
                src={state.persona.avatar_url} 
                alt={state.persona?.persona_name || 'AI Assistant'} 
                className="h-10 w-10 rounded-full border-2 border-white shadow-sm"
              />
            ) : (
              <Bot className="h-6 w-6 text-green-600" />
            )}
            
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {state.persona?.persona_name || 'AI Assistant'}
              </h2>
              <p className="text-sm text-gray-500">
                {role.title} Specialist
              </p>
            </div>
            
            {state.useTestMode && (
              <div className="flex items-center text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                <span>Basic mode</span>
              </div>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {state.error && (
            <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-4 flex items-center space-x-2">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <p>{state.error}</p>
                {state.initialLoadFailed && (
                  <button 
                    onClick={() => fetchInitialGreeting(true)}
                    className="mt-2 flex items-center text-red-700 hover:text-red-900"
                  >
                    <ArrowPathIcon className="h-4 w-4 mr-1" />
                    Try again
                  </button>
                )}
              </div>
            </div>
          )}
          
          {state.messages.map((message) => (
            <GPTMessageBubble
              key={message.id}
              message={message}
              avatar={message.role === 'assistant' ? state.persona?.avatar_url : undefined}
            />
          ))}
          
          {state.isTyping && (
            <div className="flex justify-start items-end space-x-2">
              {state.persona?.avatar_url ? (
                <img 
                  src={state.persona.avatar_url}
                  alt={state.persona?.persona_name || 'AI Assistant'} 
                  className="h-8 w-8 rounded-full mb-2 border border-gray-200"
                />
              ) : (
                <Bot className="h-6 w-6 text-green-600 flex-shrink-0 mb-2" />
              )}
              <div className="bg-gray-100 rounded-2xl px-4 py-2">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          )}
          
          {/* Progress indicator */}
          {state.questions.length > 0 && !state.interviewComplete && (
            <div className="mt-6 mb-2">
              <ProgressBar
                current={state.questionIndex}
                total={state.questions.length}
              />
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Uploaded Files */}
        {state.uploadedAssets.length > 0 && (
          <div className="p-4 border-t border-gray-100">
            <h4 className="text-xs font-medium text-gray-500 mb-2">Attached Files:</h4>
            <div className="space-y-2">
              {state.uploadedAssets.map(asset => (
                <div key={asset.id} className="flex items-center text-sm bg-gray-50 rounded p-2">
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-gray-700">{asset.name}</p>
                    <div className="flex items-center">
                      {asset.status === 'uploading' ? (
                        <>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mr-2">
                            <div 
                              className="bg-green-500 h-1.5 rounded-full" 
                              style={{ width: `${asset.progress || 0}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{asset.progress}%</span>
                        </>
                      ) : asset.status === 'success' ? (
                        <span className="text-xs text-green-600">Uploaded successfully</span>
                      ) : (
                        <span className="text-xs text-red-600">{asset.error || 'Failed to upload'}</span>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => handleRemoveFile(asset.id)}
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
              <ArrowPathIcon className="h-5 w-5" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
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
              disabled={state.isLoading}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={state.isLoading || !input.trim()}
              className={`rounded-full p-2 ${
                state.isLoading || !input.trim()
                  ? 'bg-gray-100 text-gray-400'
                  : 'bg-green-600 text-white hover:bg-green-700'
              } transition-colors flex-shrink-0`}
            >
              {state.isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <PaperAirplaneIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 