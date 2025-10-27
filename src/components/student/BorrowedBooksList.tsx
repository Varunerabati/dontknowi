'use client'

import { useState } from 'react'
import ReturnConfirmModal from './ReturnConfirmModal'

interface BorrowedBook {
  recordId: number
  bookId: string
  title: string
  author: string
  isbn: string
  borrowedDate: string
  dueDate: string
  daysRemaining: number
  isOverdue: boolean
}

interface BorrowedBooksListProps {
  books: BorrowedBook[]
  onReturnSuccess: () => void
}

export default function BorrowedBooksList({ books, onReturnSuccess }: BorrowedBooksListProps) {
  const [selectedBook, setSelectedBook] = useState<{
    recordId: number
    bookId: string
    title: string
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleReturnClick = (book: BorrowedBook) => {
    setSelectedBook({
      recordId: book.recordId,
      bookId: book.bookId,
      title: book.title,
    })
  }

  const handleConfirmReturn = async () => {
    if (!selectedBook) return

    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/student/return', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recordId: selectedBook.recordId }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: data.message })
        setSelectedBook(null)
        onReturnSuccess()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to return book' })
        setSelectedBook(null)
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' })
      setSelectedBook(null)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">My Borrowed Books</h2>

      {message && (
        <div
          className={`mb-4 p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {books.length === 0 ? (
        <p className="text-gray-500">You haven't borrowed any books yet.</p>
      ) : (
        <div className="space-y-4">
          {books.map((book) => (
            <div
              key={book.recordId}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{book.title}</h3>
                  <div className="mt-1 text-sm text-gray-600">
                    <p>Book ID: {book.bookId} | Author: {book.author}</p>
                    <p>ISBN: {book.isbn}</p>
                  </div>
                  <div className="mt-3 flex gap-4 text-sm">
                    <span>
                      <span className="font-medium">Borrowed:</span> {formatDate(book.borrowedDate)}
                    </span>
                    <span>
                      <span className="font-medium">Due:</span> {formatDate(book.dueDate)}
                    </span>
                  </div>
                  <div className="mt-2">
                    {book.isOverdue ? (
                      <span className="inline-block px-3 py-1 bg-red-100 text-red-800 text-sm font-semibold rounded">
                        OVERDUE ({Math.abs(book.daysRemaining)} days)
                      </span>
                    ) : (
                      <span className="text-sm text-gray-600">
                        {book.daysRemaining} days remaining
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleReturnClick(book)}
                  disabled={loading}
                  className="ml-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-green-400 disabled:cursor-not-allowed"
                >
                  Return
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedBook && (
        <ReturnConfirmModal
          book={selectedBook}
          onConfirm={handleConfirmReturn}
          onCancel={() => setSelectedBook(null)}
        />
      )}
    </div>
  )
}
