import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()

    if (!session || session.user.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Calculate stats
    const [
      totalBooks,
      availableBooks,
      borrowedBooks,
      totalStudents,
      activeBorrows,
      overdueBooks,
    ] = await Promise.all([
      prisma.book.count(),
      prisma.book.count({ where: { status: 'AVAILABLE' } }),
      prisma.book.count({ where: { status: 'BORROWED' } }),
      prisma.student.count(),
      prisma.borrowRecord.count({ where: { status: { in: ['ACTIVE', 'OVERDUE'] } } }),
      prisma.borrowRecord.count({ where: { status: 'OVERDUE' } }),
    ])

    const stats = {
      totalBooks,
      availableBooks,
      borrowedBooks,
      totalStudents,
      activeBorrows,
      overdueBooks,
    }

    // Recent activity (last 10 transactions)
    const recentRecords = await prisma.borrowRecord.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        student: true,
        book: true,
      },
    })

    const recentActivity = recentRecords.map((record) => ({
      recordId: record.recordId,
      studentName: record.student.name,
      bookTitle: record.book.title,
      action: record.returnDate ? ('returned' as const) : ('borrowed' as const),
      date: (record.returnDate || record.borrowedDate).toISOString(),
    }))

    // Overdue list
    const now = new Date()
    const overdueRecords = await prisma.borrowRecord.findMany({
      where: {
        status: { in: ['ACTIVE', 'OVERDUE'] },
        dueDate: { lt: now },
      },
      include: {
        student: true,
        book: true,
      },
    })

    const overdueList = overdueRecords.map((record) => {
      const daysOverdue = Math.floor(
        (now.getTime() - record.dueDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      return {
        studentName: record.student.name,
        studentRollNumber: record.student.rollNumber,
        bookTitle: record.book.title,
        bookId: record.book.bookId,
        dueDate: record.dueDate.toISOString(),
        daysOverdue,
      }
    })

    return NextResponse.json({
      stats,
      recentActivity,
      overdueList,
    })
  } catch (error) {
    console.error('Admin dashboard error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
