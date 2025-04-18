import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-green-50">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <Link
          href="/"
          className="rounded-md bg-gradient-to-r from-green-800 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:scale-105 transition-transform duration-200 ease-in-out"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
} 