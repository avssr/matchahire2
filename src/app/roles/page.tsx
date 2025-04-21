'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import type { Role } from '@/lib/supabase'
import RoleModal from '@/components/RoleModal'
import ChatModal from '@/components/ChatModal'
import QuickApplyModal from '@/components/QuickApplyModal'
import { Briefcase, MapPin, Building2, Calendar } from 'lucide-react'
import RoleCard from '@/components/RoleCard'

// Sample role data for testing when Supabase is not available
const SAMPLE_ROLES: Role[] = [
  {
    id: '1',
    title: 'Frontend Developer',
    description: 'We are looking for a skilled Frontend Developer to join our engineering team. You will build user-facing features, implement responsive designs, and work closely with designers and backend developers.',
    requirements: [
      'Proficiency in HTML, CSS, and JavaScript',
      '3+ years of experience with React.js',
      'Experience with responsive design and cross-browser compatibility',
      'Understanding of REST APIs and how to integrate them',
      'Familiarity with modern frontend build pipelines and tools'
    ],
    location: 'San Francisco, CA (Remote Friendly)',
    tags: ['React', 'JavaScript', 'TypeScript', 'UI/UX', 'Redux'],
    created_at: new Date().toISOString(),
    companies: {
      id: '1',
      name: 'TechInnovate',
      industry: 'Technology',
      created_at: new Date().toISOString()
    }
  },
  {
    id: '2',
    title: 'Backend Engineer',
    description: 'Join our backend team to design and implement scalable APIs, microservices, and infrastructure. You will work on our core platform that powers all our client-facing applications.',
    requirements: [
      'Strong experience with Node.js or Python',
      'Knowledge of database design and optimization',
      'Experience with cloud infrastructure (AWS, GCP, or Azure)',
      'Understanding of API design principles',
      'Experience with containerization technologies (Docker, Kubernetes)'
    ],
    location: 'New York, NY (Hybrid)',
    tags: ['Node.js', 'Python', 'AWS', 'Microservices', 'PostgreSQL'],
    created_at: new Date().toISOString(),
    companies: {
      id: '2',
      name: 'DataStack',
      industry: 'Data Infrastructure',
      created_at: new Date().toISOString()
    }
  },
  {
    id: '3',
    title: 'UX/UI Designer',
    description: 'As a UX/UI Designer, you will create intuitive and engaging user experiences for our products. You will collaborate with product managers and developers to deliver designs that meet user needs and business goals.',
    requirements: [
      'Portfolio demonstrating strong UI/UX design skills',
      'Proficiency in design tools such as Figma, Sketch, or Adobe XD',
      'Experience conducting user research and usability testing',
      'Ability to translate user needs into design solutions',
      'Understanding of design systems and component libraries'
    ],
    location: 'Seattle, WA (Remote)',
    tags: ['UI', 'UX', 'Figma', 'User Research', 'Design Systems'],
    created_at: new Date().toISOString(),
    companies: {
      id: '3',
      name: 'CreateUI',
      industry: 'Design Agency',
      created_at: new Date().toISOString()
    }
  }
];

export default function RolesPage() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [chatRole, setChatRole] = useState<Role | null>(null)
  const [applyRole, setApplyRole] = useState<Role | null>(null)
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [useTestData, setUseTestData] = useState(false)

  // Fetch roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true)
        setError(null)
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        
        const { data, error: supabaseError } = await supabase
          .from('roles')
          .select(`
            *,
            companies (
              name,
              industry,
              logo_url
            )
          `)
        
        if (supabaseError) throw new Error(supabaseError.message)
        
        if (!data || data.length === 0) {
          console.log('No roles found in Supabase, using sample data');
          setUseTestData(true);
          setRoles(SAMPLE_ROLES);
        } else {
          setRoles(data);
        }
      } catch (err) {
        console.error('Error fetching roles:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch roles');
        setUseTestData(true);
        setRoles(SAMPLE_ROLES);
      } finally {
        setLoading(false)
      }
    }
    fetchRoles()
  }, [])

  const handleChatWithAI = (role: Role) => {
    setChatRole(role)
  }

  const handleQuickApply = (role: Role) => {
    setApplyRole(role)
  }

  // Close all modals
  const closeAllModals = () => {
    setSelectedRole(null)
    setChatRole(null)
    setApplyRole(null)
  }

  // Handle role card click
  const handleRoleClick = (role: Role) => {
    closeAllModals()
    setSelectedRole(role)
  }

  // Handle Chat with AI button click
  const handleChatClick = (e: React.MouseEvent, role: Role) => {
    e.stopPropagation()
    closeAllModals()
    setChatRole(role)
  }

  // Handle Quick Apply button click
  const handleApplyClick = (e: React.MouseEvent, role: Role) => {
    e.stopPropagation()
    closeAllModals()
    setApplyRole(role)
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

  if (error && !useTestData) {
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
          {useTestData && (
            <div className="mt-2 inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
              Using demo data
            </div>
          )}
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
                role={role}
                onViewDetails={handleRoleClick}
                onChatWithAI={handleChatWithAI}
                onQuickApply={handleQuickApply}
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
            requirements: selectedRole.requirements,
            skills: selectedRole.tags,
            location: selectedRole.location,
            salary: 'Competitive' // TODO: Add salary to role data
          }}
          onClose={() => setSelectedRole(null)}
        />
      )}

      {chatRole && (
        <ChatModal
          role={chatRole}
          onClose={() => setChatRole(null)}
        />
      )}

      {applyRole && (
        <QuickApplyModal
          role={applyRole}
          onClose={() => setApplyRole(null)}
        />
      )}
    </main>
  )
} 