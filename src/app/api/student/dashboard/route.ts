import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()

    if (!session || session.user.type !== 'student') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const studentRollNumber = session.user.id

    // Fetch all borrow records for the student
    const allRecords = await prisma.borrowRecord.findMany({
      where: {
        studentRollNumber,
      },
    })

    // Fetch active borrowed books with book details
    const activeBorrows = await prisma.borrowRecord.findMany({
      where: {
        studentRollNumber,
        status: {
          in: ['ACTIVE', 'OVERDUE'],
        },
      },
      include: {
        book: true,
      },
      orderBy: {
        borrowedDate: 'desc',
      },
    })

    const now = new Date()

    // Count overdue books
    const overdueCount = activeBorrows.filter(
      (record) => record.dueDate < now && record.status !== 'RETURNED'
    ).length

    // Calculate stats
    const stats = {
      currentlyBorrowed: activeBorrows.length,
      overdueBooks: overdueCount,
      totalBorrowed: allRecords.length,
    }

    // Format borrowed books
    const borrowedBooks = activeBorrows.map((record) => {
      const daysRemaining = Math.ceil(
        (record.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
      const isOverdue = daysRemaining < 0

      return {
        recordId: record.recordId,
        bookId: record.book.bookId,
        title: record.book.title,
        author: record.book.author,
        isbn: record.book.isbn,
        borrowedDate: record.borrowedDate.toISOString(),
        dueDate: record.dueDate.toISOString(),
        daysRemaining,
        isOverdue,
      }
    })

    return NextResponse.json({
      stats,
      borrowedBooks,
    })
  } catch (error) {
    console.error('Student dashboard error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
