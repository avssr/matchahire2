import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-green-50">
      {/* Hero Section */}
      <section className="px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            AI-Powered Hiring for Modern Teams
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Experience intelligent job matching through conversational AI. Connect with roles that align with your values and aspirations.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/roles"
              className="rounded-md bg-gradient-to-r from-green-800 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:scale-105 transition-transform duration-200 ease-in-out"
            >
              Start Your Journey
            </Link>
            <Link
              href="/post"
              className="text-sm font-semibold leading-6 text-gray-900 hover:text-green-800"
            >
              Post a Role <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Value Props Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-green-800">Better Hiring</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Reimagining the Job Search Experience
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  🎯 Smart Role Matching
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Our AI understands your skills and aspirations, matching you with roles where you'll thrive.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  🤖 AI Discovery
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Chat with intelligent role personas to understand company culture and expectations.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  ✨ Clarity Before Commitment
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Get deep insights into roles and company culture before applying, ensuring better matches.
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </main>
  )
} 