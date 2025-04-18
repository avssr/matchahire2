'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export default function PostPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    level: '',
    tags: [] as string[],
    description: '',
    requirements: [] as string[],
    responsibilities: [] as string[],
    persona: {
      persona_name: '',
      tone: '',
      conversation_mode: 'structured',
      system_prompt: '',
      question_sequence: {
        questions: [] as { id: string; text: string; type: string }[]
      },
      scoring_prompt: '',
      email_prompt: ''
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // First, get the company ID for SmartJoules (hardcoded for now)
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('name', 'SmartJoules')
      .single()

    if (!company) {
      console.error('Company not found')
      return
    }

    // Create the role
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .insert({
        company_id: company.id,
        ...formData
      })
      .select()
      .single()

    if (roleError) {
      console.error('Error creating role:', roleError)
      return
    }

    // Create the persona
    const { error: personaError } = await supabase
      .from('personas')
      .insert({
        role_id: role.id,
        ...formData.persona
      })

    if (personaError) {
      console.error('Error creating persona:', personaError)
      return
    }

    // Redirect to roles page
    window.location.href = '/roles'
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-green-50 py-12">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Post a New Role
          </h1>
          <p className="mt-2 text-lg leading-8 text-gray-600">
            Create an engaging role with an AI persona to connect with candidates.
          </p>
        </div>

        <div className="mt-16">
          <div className="flex justify-center mb-8">
            <div className="flex items-center">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-green-800 text-white' : 'bg-gray-200'
              }`}>
                1
              </div>
              <div className={`h-1 w-16 ${step >= 2 ? 'bg-green-800' : 'bg-gray-200'}`} />
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-green-800 text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {step === 1 ? (
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">
                    Role Title
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-800 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium leading-6 text-gray-900">
                    Location
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-800 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
                    Description
                  </label>
                  <div className="mt-2">
                    <textarea
                      id="description"
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-800 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="rounded-md bg-gradient-to-r from-green-800 to-teal-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:scale-105 transition-transform duration-200 ease-in-out"
                  >
                    Next: Configure AI Persona
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label htmlFor="persona_name" className="block text-sm font-medium leading-6 text-gray-900">
                    Persona Name
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      id="persona_name"
                      value={formData.persona.persona_name}
                      onChange={(e) => setFormData({
                        ...formData,
                        persona: { ...formData.persona, persona_name: e.target.value }
                      })}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-800 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="system_prompt" className="block text-sm font-medium leading-6 text-gray-900">
                    System Prompt
                  </label>
                  <div className="mt-2">
                    <textarea
                      id="system_prompt"
                      rows={4}
                      value={formData.persona.system_prompt}
                      onChange={(e) => setFormData({
                        ...formData,
                        persona: { ...formData.persona, system_prompt: e.target.value }
                      })}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-800 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="rounded-md bg-white px-6 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="rounded-md bg-gradient-to-r from-green-800 to-teal-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:scale-105 transition-transform duration-200 ease-in-out"
                  >
                    Create Role
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </main>
  )
} 