import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Role } from '@/lib/supabase'

async function getRoles() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
  
  const { data: roles } = await supabase
    .from('roles')
    .select(`
      *,
      companies (
        name,
        industry,
        logo_url
      )
    `)
  return roles
}

export default async function RolesPage() {
  const roles = await getRoles()

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-green-50 py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Open Roles
          </h1>
          <p className="mt-2 text-lg leading-8 text-gray-600">
            Discover opportunities that match your skills and aspirations.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-12 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {roles?.map((role) => (
            <article
              key={role.id}
              className="flex flex-col items-start justify-between bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center gap-x-4 text-xs">
                <time dateTime={role.created_at} className="text-gray-500">
                  {new Date(role.created_at).toLocaleDateString()}
                </time>
                {role.tags.map((tag) => (
                  <span
                    key={tag}
                    className="relative z-10 rounded-full bg-green-50 px-3 py-1.5 font-medium text-green-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="group relative">
                <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-green-800">
                  {role.title}
                </h3>
                <div className="mt-2 flex items-center gap-x-2">
                  {role.companies?.logo_url && (
                    <img
                      src={role.companies.logo_url}
                      alt={role.companies?.name}
                      className="h-6 w-6 rounded-full bg-gray-50"
                    />
                  )}
                  <span className="text-sm text-gray-500">{role.companies?.name}</span>
                  <span className="text-sm text-gray-400">•</span>
                  <span className="text-sm text-gray-500">{role.location}</span>
                </div>
                <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600">
                  {role.description}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-x-3">
                <button
                  type="button"
                  className="rounded-md bg-gradient-to-r from-green-800 to-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:scale-105 transition-transform duration-200 ease-in-out"
                >
                  Chat with AI
                </button>
                <button
                  type="button"
                  className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  Quick Apply
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  )
} 