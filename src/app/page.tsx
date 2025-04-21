import Link from 'next/link'
import { ArrowRight, Target, Bot, Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-green-50">
      {/* Hero Section */}
      <section className="relative isolate px-6 py-24 sm:py-32 lg:px-8">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-green-200 to-teal-200 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>

        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-green-800 to-teal-600 sm:text-6xl">
            AI-Powered Hiring for Modern Teams
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Experience intelligent job matching through conversational AI. Connect with roles that align with your values and aspirations.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/roles"
              className="group btn-primary inline-flex items-center gap-2"
            >
              Start Your Journey
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/post"
              className="btn-secondary inline-flex items-center gap-1"
            >
              Post a Role <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
          <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-green-200 to-teal-200 opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
      </section>

      {/* Value Props Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-green-800">Better Hiring</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-green-800 to-teal-600 sm:text-4xl">
              Reimagining the Job Search Experience
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              We're transforming how companies and candidates connect, making the hiring process more intelligent, transparent, and effective.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <div className="rounded-lg bg-green-50 p-2">
                    <Target className="h-5 w-5 text-green-800" />
                  </div>
                  Smart Role Matching
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Our AI understands your skills and aspirations, matching you with roles where you'll thrive.
                  </p>
                  <p className="mt-6">
                    <Link href="/roles" className="text-sm font-semibold leading-6 text-green-800">
                      Find your match <span aria-hidden="true">→</span>
                    </Link>
                  </p>
                </dd>
              </div>
              <div className="flex flex-col bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <div className="rounded-lg bg-green-50 p-2">
                    <Bot className="h-5 w-5 text-green-800" />
                  </div>
                  AI Discovery
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Chat with intelligent role personas to understand company culture and expectations.
                  </p>
                  <p className="mt-6">
                    <Link href="/roles" className="text-sm font-semibold leading-6 text-green-800">
                      Start chatting <span aria-hidden="true">→</span>
                    </Link>
                  </p>
                </dd>
              </div>
              <div className="flex flex-col bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <div className="rounded-lg bg-green-50 p-2">
                    <Sparkles className="h-5 w-5 text-green-800" />
                  </div>
                  Clarity Before Commitment
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Get deep insights into roles and company culture before applying, ensuring better matches.
                  </p>
                  <p className="mt-6">
                    <Link href="/roles" className="text-sm font-semibold leading-6 text-green-800">
                      Learn more <span aria-hidden="true">→</span>
                    </Link>
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