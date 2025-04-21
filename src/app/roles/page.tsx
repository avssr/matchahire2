'use client'

import { useState, useEffect } from 'react'
import RoleModal from '@/components/RoleModal'
import ChatModal from '@/components/ChatModal'
import QuickApplyModal from '@/components/QuickApplyModal'
import { Briefcase } from 'lucide-react'
import RoleCard from '@/components/RoleCard'
import { Role } from '@/types/gpt'
import { RoleService } from '@/utils/apiService'
import { logger } from '@/utils/logger'

// Type augmentation to support sessionId in chat and requirements array conversion
interface RoleWithChatSession extends Role {
  chatSessionId?: string;
  // Convert string requirements to array for RoleModal
  requirementsArray?: string[];
}

export default function RolesPage() {
  const [selectedRole, setSelectedRole] = useState<RoleWithChatSession | null>(null)
  const [chatRole, setChatRole] = useState<RoleWithChatSession | null>(null)
  const [applyRole, setApplyRole] = useState<RoleWithChatSession | null>(null)
  const [roles, setRoles] = useState<RoleWithChatSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await RoleService.getRoles()
        
        if (!response.success) {
          throw new Error(response.error || 'Failed to fetch roles')
        }
        
        // Process the roles to ensure requirements is an array for components
        const processedRoles = response.data?.map(role => ({
          ...role,
          // Convert string requirements to array if needed
          requirementsArray: typeof role.requirements === 'string' 
            ? role.requirements.split(/\n+/).filter(Boolean)
            : (Array.isArray(role.requirements) ? role.requirements : [])
        })) || []
        
        setRoles(processedRoles)
      } catch (err) {
        logger.error('Error fetching roles:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch roles')
      } finally {
        setLoading(false)
      }
    }
    
    fetchRoles()
  }, [])

  const handleChatWithAI = async (role: RoleWithChatSession) => {
    try {
      const response = await RoleService.startChatSession(role.id)
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to start chat session')
      }
      
      // Store sessionId with role for the chat modal
      setChatRole({
        ...role,
        chatSessionId: response.data?.sessionId
      })
    } catch (err) {
      logger.error('Error starting chat session:', err)
      alert('Could not start chat session. Please try again.')
    }
  }

  const handleQuickApply = (role: RoleWithChatSession) => {
    setApplyRole(role)
  }

  // Close all modals
  const closeAllModals = () => {
    setSelectedRole(null)
    setChatRole(null)
    setApplyRole(null)
  }

  // Handle role card click
  const handleRoleClick = (role: RoleWithChatSession) => {
    closeAllModals()
    setSelectedRole(role)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white to-green-50 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="animate-pulse">
              <div className="h-8 w-48 bg-gray-200 rounded mx-auto mb-4"></div>
              <div className="h-4 w-64 bg-gray-200 rounded mx-auto"></div>
            </div>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-12 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-white p-6 rounded-2xl">
                <div className="h-4 w-24 bg-gray-200 rounded mb-4"></div>
                <div className="h-6 w-48 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
                <div className="h-20 w-full bg-gray-200 rounded mb-4"></div>
                <div className="flex gap-4">
                  <div className="h-10 w-24 bg-gray-200 rounded"></div>
                  <div className="h-10 w-24 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white to-green-50 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Oops! Something went wrong
            </h1>
            <p className="mt-2 text-lg leading-8 text-gray-600">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-green-50 py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-green-800 to-teal-600">
            Open Roles
          </h1>
          <p className="mt-2 text-lg leading-8 text-gray-600">
            Discover opportunities that match your skills and aspirations.
          </p>
        </div>

        {roles.length === 0 ? (
          <div className="mx-auto mt-16 max-w-2xl text-center">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No roles available</h3>
            <p className="mt-1 text-sm text-gray-500">Check back later for new opportunities.</p>
          </div>
        ) : (
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-12 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {roles.map((role) => (
              <RoleCard
                key={role.id}
                role={role as any /* Type cast to make it compatible */}
                onViewDetails={handleRoleClick as any}
                onChatWithAI={handleChatWithAI as any}
                onQuickApply={handleQuickApply as any}
              />
            ))}
          </div>
        )}
      </div>

      {selectedRole && (
        <RoleModal
          role={{
            title: selectedRole.title,
            company: selectedRole.companies?.name || '',
            description: selectedRole.description,
            requirements: selectedRole.requirementsArray || [],
            skills: selectedRole.tags || selectedRole.skills || [],
            location: selectedRole.location,
            salary: selectedRole.salary || 'Competitive',
            companyDescription: selectedRole.companies?.description || '',
            companyLogo: selectedRole.companies?.logo_url || '',
          }}
          onClose={closeAllModals}
        />
      )}

      {chatRole && (
        <ChatModal
          role={chatRole as any /* Type cast to make it compatible */}
          sessionId={chatRole.chatSessionId || ''}
          onClose={closeAllModals}
        />
      )}

      {applyRole && (
        <QuickApplyModal
          role={applyRole as any /* Type cast to make it compatible */}
          onClose={closeAllModals}
        />
      )}
    </main>
  )
} 