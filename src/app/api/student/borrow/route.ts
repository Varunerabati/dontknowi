import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.type !== 'student') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { bookId } = body

    if (!bookId) {
      return NextResponse.json(
        { error: 'Book ID is required' },
        { status: 400 }
      )
    }

    const studentRollNumber = session.user.id

    // 1. Check if book exists
    const book = await prisma.book.findUnique({
      where: { bookId },
    })

    if (!book) {
      return NextResponse.json(
        { error: `Book ID '${bookId}' does not exist` },
        { status: 404 }
      )
    }

    // 2. Check if book is available
    if (book.status !== 'AVAILABLE') {
      return NextResponse.json(
        { error: 'This book is currently checked out' },
        { status: 400 }
      )
    }

    // 3. Count student's active borrows
    const activeBorrowsCount = await prisma.borrowRecord.count({
      where: {
        studentRollNumber,
        status: {
          in: ['ACTIVE', 'OVERDUE'],
        },
      },
    })

    if (activeBorrowsCount >= 3) {
      return NextResponse.json(
        { error: 'Maximum borrow limit (3 books) reached. Please return a book first' },
        { status: 400 }
      )
    }

    // 4. Check for overdue books
    const now = new Date()
    const overdueCount = await prisma.borrowRecord.count({
      where: {
        studentRollNumber,
        status: {
          in: ['ACTIVE', 'OVERDUE'],
        },
        dueDate: {
          lt: now,
        },
      },
    })

    if (overdueCount > 0) {
      return NextResponse.json(
        { error: `Cannot borrow. You have ${overdueCount} overdue book(s). Please return them first` },
        { status: 403 }
      )
    }

    // Calculate due date (30 days from now)
    const borrowedDate = new Date()
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 30)

    // Create borrow record and update book status in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create borrow record
      const borrowRecord = await tx.borrowRecord.create({
        data: {
          bookId,
          studentRollNumber,
          borrowedDate,
          dueDate,
          status: 'ACTIVE',
        },
      })

      // Update book status
      await tx.book.update({
        where: { bookId },
        data: { status: 'BORROWED' },
      })

      return borrowRecord
    })

    return NextResponse.json(
      {
        success: true,
        message: `Book '${book.title}' borrowed successfully. Due date: ${dueDate.toLocaleDateString()}`,
        record: {
          recordId: result.recordId,
          bookId: book.bookId,
          title: book.title,
          borrowedDate: result.borrowedDate.toISOString(),
          dueDate: result.dueDate.toISOString(),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Borrow book error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
