'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createBrowserClient } from '@supabase/ssr'
import type { Company, Role } from '@/lib/supabase'

export default function CompanyPage() {
  const [activeTab, setActiveTab] = useState('company')
  const [company, setCompany] = useState<Company | null>(null)
  const [roles, setRoles] = useState<Role[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // Get SmartJoules company data
      const { data: companyData } = await supabase
        .from('companies')
        .select('*')
        .eq('name', 'SmartJoules')
        .single()

      if (companyData) {
        setCompany(companyData)

        // Get roles for the company
        const { data: rolesData } = await supabase
          .from('roles')
          .select('*')
          .eq('company_id', companyData.id)

        if (rolesData) {
          setRoles(rolesData)
        }
      }
    }

    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm min-h-screen p-4">
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('company')}
              className={`w-full text-left px-4 py-2 rounded-md ${
                activeTab === 'company'
                  ? 'bg-green-50 text-green-800'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Company
            </button>
            <button
              onClick={() => setActiveTab('jobs')}
              className={`w-full text-left px-4 py-2 rounded-md ${
                activeTab === 'jobs'
                  ? 'bg-green-50 text-green-800'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Jobs
            </button>
            <button
              onClick={() => setActiveTab('candidates')}
              className={`w-full text-left px-4 py-2 rounded-md ${
                activeTab === 'candidates'
                  ? 'bg-green-50 text-green-800'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Candidates
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full text-left px-4 py-2 rounded-md ${
                activeTab === 'settings'
                  ? 'bg-green-50 text-green-800'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Settings
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeTab === 'company' && company && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-6">{company.name}</h1>
              <div className="bg-white shadow-sm rounded-lg p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">About</h2>
                  <p className="mt-2 text-gray-600">{company.description}</p>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Industry</h2>
                  <p className="mt-2 text-gray-600">{company.industry}</p>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Values</h2>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {company.values.map((value) => (
                      <span
                        key={value}
                        className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-800"
                      >
                        {value}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Culture</h2>
                  <p className="mt-2 text-gray-600">{company.culture}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'jobs' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Posted Roles</h1>
                <Link
                  href="/post"
                  className="rounded-md bg-gradient-to-r from-green-800 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:scale-105 transition-transform duration-200 ease-in-out"
                >
                  Add New Role
                </Link>
              </div>
              <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Level
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Posted
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {roles.map((role) => (
                      <tr key={role.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {role.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {role.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {role.level}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(role.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'candidates' && (
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon</h1>
              <p className="text-gray-600">
                The candidates dashboard is under development.
              </p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon</h1>
              <p className="text-gray-600">
                Company settings will be available soon.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 