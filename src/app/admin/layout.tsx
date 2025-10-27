'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session } = useSession()
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard' },
    { name: 'Books', href: '/admin/books' },
    { name: 'Students', href: '/admin/students' },
    { name: 'Borrow Records', href: '/admin/borrow-records' },
    { name: 'Admins', href: '/admin/admins' },
  ]

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-indigo-900 min-h-screen">
          <div className="p-6">
            <h1 className="text-white text-xl font-bold">Admin Panel</h1>
            <p className="text-indigo-300 text-sm mt-1">{session?.user?.name}</p>
          </div>
          <nav className="mt-6">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-6 py-3 text-sm font-medium ${
                    isActive
                      ? 'bg-indigo-800 text-white border-l-4 border-white'
                      : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              )
            })}
          </nav>
          <div className="absolute bottom-0 w-64 p-6">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <main className="p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
