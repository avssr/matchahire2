import React from 'react'
import { 
  BuildingOffice2Icon, 
  MapPinIcon, 
  CalendarIcon, 
  ArrowsPointingOutIcon,
  ChatBubbleLeftRightIcon, 
  PaperAirplaneIcon
} from '@heroicons/react/24/outline'
import type { Role } from '@/lib/supabase'

interface RoleCardProps {
  role: Role
  onViewDetails: (role: Role) => void
  onChatWithAI: (role: Role) => void
  onQuickApply: (role: Role) => void
}

export default function RoleCard({ role, onViewDetails, onChatWithAI, onQuickApply }: RoleCardProps) {
  const companyName = role.companies?.name || 'Company'
  const formattedDate = new Date(role.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  return (
    <div 
      className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onViewDetails(role)}
    >
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900">{role.title}</h3>
        <div className="flex items-center mt-1 text-gray-600">
          <BuildingOffice2Icon className="h-4 w-4 mr-1" />
          <span>{companyName}</span>
        </div>
      </div>
      
      <p className="text-gray-700 mb-4 line-clamp-3">{role.description}</p>
      
      <div className="grid grid-cols-2 gap-2 mb-4 text-sm text-gray-600">
        <div className="flex items-center">
          <MapPinIcon className="h-4 w-4 mr-1" />
          <span>{role.location}</span>
        </div>
        <div className="flex items-center">
          <CalendarIcon className="h-4 w-4 mr-1" />
          <span>Posted {formattedDate}</span>
        </div>
      </div>
      
      {/* Tags */}
      {role.tags && role.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {role.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      
      <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(role);
          }}
          className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700"
        >
          <ArrowsPointingOutIcon className="h-4 w-4 mr-1" />
          View Details
        </button>
        
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onChatWithAI(role);
            }}
            className="bg-green-50 text-green-600 px-3 py-1 rounded-md text-sm font-medium hover:bg-green-100 flex items-center"
          >
            <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
            Chat with AI
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickApply(role);
            }}
            className="bg-green-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-green-700 flex items-center"
          >
            <PaperAirplaneIcon className="h-4 w-4 mr-1" />
            Quick Apply
          </button>
        </div>
      </div>
    </div>
  )
} 