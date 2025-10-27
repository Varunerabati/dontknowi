'use client'

import { useEffect, useState } from 'react'

interface Admin {
  adminId: string
  name: string
  email: string
}

export default function AdminAdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    adminId: '',
    name: '',
    email: '',
    password: '',
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchAdmins = async () => {
    try {
      const res = await fetch('/api/admin/admins')
      const data = await res.json()
      setAdmins(data.admins)
    } catch (error) {
      console.error('Error fetching admins:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdmins()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    try {
      const res = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: data.message })
        setShowForm(false)
        setFormData({ adminId: '', name: '', email: '', password: '' })
        fetchAdmins()
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong' })
    }
  }

  const handleDelete = async (adminId: string) => {
    if (!confirm('Are you sure you want to delete this admin?')) return

    try {
      const res = await fetch(`/api/admin/admins/${adminId}`, { method: 'DELETE' })
      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: data.message })
        fetchAdmins()
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete admin' })
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Admins</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Add New Admin
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-bold mb-4">Add New Admin</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Admin ID</label>
              <input
                type="text"
                value={formData.adminId}
                onChange={(e) => setFormData({ ...formData, adminId: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                required
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
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                Add Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setFormData({ adminId: '', name: '', email: '', password: '' })
                }}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
              >
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {admins.map((admin) => (
              <tr key={admin.adminId}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{admin.adminId}</td>
                <td className="px-6 py-4 text-sm">{admin.name}</td>
                <td className="px-6 py-4 text-sm">{admin.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleDelete(admin.adminId)}
                    disabled={admins.length === 1}
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
    </div>
  )
}
