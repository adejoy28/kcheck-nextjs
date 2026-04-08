import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center px-4">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
        </div>
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-600">
            Sorry, we couldn't find the page you're looking for. The page might have been removed, renamed, or is temporarily unavailable.
          </p>
        </div>
        <div className="space-y-3">
          <Link
            href="/"
            className="inline-block w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Go Back Home
          </Link>
          <Link
            href="/dashboard"
            className="inline-block w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
