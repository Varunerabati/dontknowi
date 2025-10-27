'use client'

import { useEffect, useState } from 'react'

interface BorrowRecord {
  recordId: number
  bookId: string
  bookTitle: string
  studentRollNumber: string
  studentName: string
  borrowedDate: string
  dueDate: string
  returnDate: string | null
  status: 'ACTIVE' | 'RETURNED' | 'OVERDUE'
}

export default function AdminBorrowRecordsPage() {
  const [records, setRecords] = useState<BorrowRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchRecords = async () => {
    try {
      const url = `/api/admin/borrow-records?status=${statusFilter}`
      const res = await fetch(url)
      const data = await res.json()
      setRecords(data.records)
    } catch (error) {
      console.error('Error fetching records:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [statusFilter])

  const handleForceReturn = async (recordId: number) => {
    if (!confirm('Force return this book?')) return

    try {
      const res = await fetch(`/api/admin/borrow-records/${recordId}/force-return`, {
        method: 'POST',
      })
      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: data.message })
        fetchRecords()
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to return book' })
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Borrow Records</h1>

      {message && (
        <div className={`mb-4 p-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Filter by Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-md"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="returned">Returned</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Record ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Book</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Borrowed</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Returned</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.map((record) => (
              <tr key={record.recordId}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{record.recordId}</td>
                <td className="px-6 py-4 text-sm">
                  {record.bookTitle}
                  <div className="text-xs text-gray-500">{record.bookId}</div>
                </td>
                <td className="px-6 py-4 text-sm">
                  {record.studentName}
                  <div className="text-xs text-gray-500">{record.studentRollNumber}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {new Date(record.borrowedDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {new Date(record.dueDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {record.returnDate ? new Date(record.returnDate).toLocaleDateString() : 'Not Returned'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      record.status === 'ACTIVE'
                        ? 'bg-yellow-100 text-yellow-800'
                        : record.status === 'RETURNED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {record.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {(record.status === 'ACTIVE' || record.status === 'OVERDUE') && (
                    <button
                      onClick={() => handleForceReturn(record.recordId)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Force Return
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
