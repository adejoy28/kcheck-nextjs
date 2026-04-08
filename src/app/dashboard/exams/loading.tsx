export default function ExamsLoading() {
  return (
    <div>
      {/* Page header skeleton */}
      <div className="h-8 bg-gray-200 rounded w-40 mb-4 animate-pulse"></div>
      
      {/* Section header skeleton */}
      <div className="flex justify-between items-center mb-4">
        <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
        <div className="h-8 bg-gray-200 rounded w-28 animate-pulse"></div>
      </div>

      {/* Toolbar skeleton */}
      <div className="flex justify-between items-center mb-4">
        <div className="h-10 bg-gray-200 rounded w-64 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
      </div>

      {/* DataTable skeleton - matching exams table structure */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3"><div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div></th>
                <th className="px-6 py-3"><div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div></th>
                <th className="px-6 py-3"><div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div></th>
                <th className="px-6 py-3"><div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div></th>
                <th className="px-6 py-3"><div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div></th>
                <th className="px-6 py-3"><div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div></th>
                <th className="px-6 py-3"><div className="h-4 bg-gray-200 rounded w-14 animate-pulse"></div></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
