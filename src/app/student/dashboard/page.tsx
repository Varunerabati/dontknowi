'use client'

import { useEffect, useState } from 'react'
import DashboardStats from '@/components/student/DashboardStats'
import BorrowBookForm from '@/components/student/BorrowBookForm'
import BorrowedBooksList from '@/components/student/BorrowedBooksList'

interface DashboardData {
  stats: {
    currentlyBorrowed: number
    overdueBooks: number
    totalBorrowed: number
  }
  borrowedBooks: Array<{
    recordId: number
    bookId: string
    title: string
    author: string
    isbn: string
    borrowedDate: string
    dueDate: string
    daysRemaining: number
    isOverdue: boolean
  }>
}

export default function StudentDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/student/dashboard')

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const dashboardData = await response.json()
      setData(dashboardData)
      setError(null)
    } catch (err) {
      setError('Failed to load dashboard data. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-800">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div>
      <DashboardStats stats={data.stats} />
      <BorrowBookForm onBorrowSuccess={fetchDashboardData} />
      <BorrowedBooksList books={data.borrowedBooks} onReturnSuccess={fetchDashboardData} />
    </div>
  )
}
