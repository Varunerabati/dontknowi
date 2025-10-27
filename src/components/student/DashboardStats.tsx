'use client'

interface DashboardStatsProps {
  stats: {
    currentlyBorrowed: number
    overdueBooks: number
    totalBorrowed: number
  }
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-gray-500 text-sm font-medium mb-2">Currently Borrowed</h3>
        <p className="text-3xl font-bold text-indigo-600">
          {stats.currentlyBorrowed} / 3
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-gray-500 text-sm font-medium mb-2">Overdue Books</h3>
        <p className={`text-3xl font-bold ${stats.overdueBooks > 0 ? 'text-red-600' : 'text-green-600'}`}>
          {stats.overdueBooks}
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-gray-500 text-sm font-medium mb-2">Total Borrowed</h3>
        <p className="text-3xl font-bold text-gray-700">
          {stats.totalBorrowed}
        </p>
      </div>
    </div>
  )
}
