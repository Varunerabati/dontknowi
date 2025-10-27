'use client'

import { useEffect, useState } from 'react'

interface Student {
  rollNumber: string
  name: string
  email: string
  department: string
  activeBorrows: number
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [showPasswordReset, setShowPasswordReset] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    rollNumber: '',
    name: '',
    email: '',
    department: '',
    password: '',
  })
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/admin/students')
      const data = await res.json()
      setStudents(data.students)
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    try {
      const url = editingStudent ? `/api/admin/students/${editingStudent.rollNumber}` : '/api/admin/students'
      const method = editingStudent ? 'PUT' : 'POST'
      const body = editingStudent
        ? { name: formData.name, email: formData.email, department: formData.department }
        : formData

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: data.message })
        setShowForm(false)
        setEditingStudent(null)
        setFormData({ rollNumber: '', name: '', email: '', department: '', password: '' })
        fetchStudents()
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong' })
    }
  }

  const handleDelete = async (rollNumber: string) => {
    if (!confirm('Are you sure you want to delete this student?')) return

    try {
      const res = await fetch(`/api/admin/students/${rollNumber}`, { method: 'DELETE' })
      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: data.message })
        fetchStudents()
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete student' })
    }
  }

  const handleEdit = (student: Student) => {
    setEditingStudent(student)
    setFormData({
      rollNumber: student.rollNumber,
      name: student.name,
      email: student.email,
      department: student.department,
      password: '',
    })
    setShowForm(true)
  }

  const handlePasswordReset = async (rollNumber: string) => {
    if (!newPassword) {
      alert('Please enter a new password')
      return
    }

    try {
      const res = await fetch(`/api/admin/students/${rollNumber}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: data.message })
        setShowPasswordReset(null)
        setNewPassword('')
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to reset password' })
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingStudent(null)
    setFormData({ rollNumber: '', name: '', email: '', department: '', password: '' })
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Students</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Add New Student
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-bold mb-4">{editingStudent ? 'Edit Student' : 'Add New Student'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Roll Number</label>
              <input
                type="text"
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                required
                disabled={!!editingStudent}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            {!editingStudent && (
              <div>
                <label className="block text-sm font-medium mb-1">Password (min 6 characters)</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                  minLength={6}
                />
              </div>
            )}
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                {editingStudent ? 'Update' : 'Add'} Student
              </button>
              <button type="button" onClick={handleCancel} className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll Number</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active Borrows</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.rollNumber}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{student.rollNumber}</td>
                <td className="px-6 py-4 text-sm">{student.name}</td>
                <td className="px-6 py-4 text-sm">{student.email}</td>
                <td className="px-6 py-4 text-sm">{student.department}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{student.activeBorrows}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button onClick={() => handleEdit(student)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                  <button
                    onClick={() => setShowPasswordReset(student.rollNumber)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Reset Password
                  </button>
                  <button
                    onClick={() => handleDelete(student.rollNumber)}
                    disabled={student.activeBorrows > 0}
                    className="text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPasswordReset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Reset Password</h3>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min 6 characters)"
              className="w-full px-3 py-2 border rounded-md mb-4"
              minLength={6}
            />
            <div className="flex gap-2">
              <button
                onClick={() => handlePasswordReset(showPasswordReset)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Reset
              </button>
              <button
                onClick={() => {
                  setShowPasswordReset(null)
                  setNewPassword('')
                }}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
