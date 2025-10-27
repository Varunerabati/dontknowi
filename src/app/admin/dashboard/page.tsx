'use client'

import { useEffect, useState } from 'react'

interface DashboardData {
  stats: {
    totalBooks: number
    availableBooks: number
    borrowedBooks: number
    totalStudents: number
    activeBorrows: number
    overdueBooks: number
  }
  recentActivity: Array<{
    recordId: number
    studentName: string
    bookTitle: string
    action: 'borrowed' | 'returned'
    date: string
  }>
  overdueList: Array<{
    studentName: string
    bookTitle: string
    daysOverdue: number
  }>
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((res) => res.json())
      .then((data) => {
        setData(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-center py-12">Loading...</div>
  }

  if (!data) {
    return <div className="text-center py-12 text-red-600">Failed to load dashboard</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm mb-2">Total Books</h3>
          <p className="text-3xl font-bold text-indigo-600">{data.stats.totalBooks}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm mb-2">Available Books</h3>
          <p className="text-3xl font-bold text-green-600">{data.stats.availableBooks}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm mb-2">Borrowed Books</h3>
          <p className="text-3xl font-bold text-yellow-600">{data.stats.borrowedBooks}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm mb-2">Total Students</h3>
          <p className="text-3xl font-bold text-gray-700">{data.stats.totalStudents}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm mb-2">Active Borrows</h3>
          <p className="text-3xl font-bold text-blue-600">{data.stats.activeBorrows}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm mb-2">Overdue Books</h3>
          <p className="text-3xl font-bold text-red-600">{data.stats.overdueBooks}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {data.recentActivity.map((activity) => (
            <div key={activity.recordId} className="border-l-4 border-indigo-500 pl-4 py-2">
              <p className="font-medium">
                {activity.studentName} {activity.action} &quot;{activity.bookTitle}&quot;
              </p>
              <p className="text-sm text-gray-500">
                {new Date(activity.date).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Overdue Books */}
      {data.overdueList.length > 0 && (
        <div className="bg-red-50 p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-red-800 mb-4">Overdue Books</h2>
          <div className="space-y-3">
            {data.overdueList.map((item, idx) => (
              <div key={idx} className="bg-white p-4 rounded border border-red-200">
                <p className="font-medium text-red-900">
                  {item.studentName} - &quot;{item.bookTitle}&quot;
                </p>
                <p className="text-sm text-red-700">
                  Overdue by {item.daysOverdue} day(s)
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
