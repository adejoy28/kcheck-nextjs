export default function DashboardLoading() {
  return (
    <div>
      {/* Page header skeleton */}
      <div className="h-8 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
      
      {/* Section header skeleton */}
      <div className="flex justify-between items-center mb-4">
        <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
        <div className="h-8 bg-gray-200 rounded w-28 animate-pulse"></div>
      </div>

      {/* Toolbar skeleton */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-28 animate-pulse"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
      </div>

      {/* Tests list skeleton */}
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                <div className="flex gap-4">
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                </div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
              <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
