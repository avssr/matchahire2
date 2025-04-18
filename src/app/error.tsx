'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-green-50">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Oops! Something went wrong</h2>
        <p className="text-gray-600 mb-8">
          We encountered an error while processing your request.
        </p>
        <button
          onClick={reset}
          className="rounded-md bg-gradient-to-r from-green-800 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:scale-105 transition-transform duration-200 ease-in-out"
        >
          Try again
        </button>
      </div>
    </div>
  )
} 