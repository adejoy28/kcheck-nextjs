export default function ProfileLoading() {
  return (
    <div>
      {/* Page header skeleton */}
      <div className="h-8 bg-gray-200 rounded w-32 mb-6 animate-pulse"></div>
      
      {/* Profile form skeleton */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          {/* Personal info section */}
          <div>
            <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="h-4 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-16 mb-2 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-28 mb-2 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Account info section */}
          <div>
            <div className="h-6 bg-gray-200 rounded w-36 mb-4 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4 pt-4">
            <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
