'use client'

interface ReturnConfirmModalProps {
  book: {
    recordId: number
    bookId: string
    title: string
  }
  onConfirm: () => void
  onCancel: () => void
}

export default function ReturnConfirmModal({ book, onConfirm, onCancel }: ReturnConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-bold mb-4">Confirm Return</h3>
        <p className="text-gray-700 mb-6">
          Are you sure you want to return <span className="font-semibold">{book.title}</span> (ID: {book.bookId})?
        </p>
        <div className="flex gap-4 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Confirm Return
          </button>
        </div>
      </div>
    </div>
  )
}
