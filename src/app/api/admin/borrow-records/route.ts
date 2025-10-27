import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'all'
    const studentRollNumber = searchParams.get('studentRollNumber')
    const bookId = searchParams.get('bookId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build where clause
    const where: any = {}

    if (status !== 'all') {
      where.status = status.toUpperCase()
    }

    if (studentRollNumber) {
      where.studentRollNumber = studentRollNumber
    }

    if (bookId) {
      where.bookId = bookId
    }

    if (startDate || endDate) {
      where.borrowedDate = {}
      if (startDate) {
        where.borrowedDate.gte = new Date(startDate)
      }
      if (endDate) {
        where.borrowedDate.lte = new Date(endDate)
      }
    }

    // Update overdue status before fetching
    const now = new Date()
    await prisma.borrowRecord.updateMany({
      where: {
        status: 'ACTIVE',
        dueDate: { lt: now },
      },
      data: { status: 'OVERDUE' },
    })

    const records = await prisma.borrowRecord.findMany({
      where,
      include: {
        book: true,
        student: true,
      },
      orderBy: { borrowedDate: 'desc' },
    })

    const recordsData = records.map((record) => ({
      recordId: record.recordId,
      bookId: record.book.bookId,
      bookTitle: record.book.title,
      studentRollNumber: record.student.rollNumber,
      studentName: record.student.name,
      borrowedDate: record.borrowedDate.toISOString(),
      dueDate: record.dueDate.toISOString(),
      returnDate: record.returnDate?.toISOString() || null,
      status: record.status,
    }))

    return NextResponse.json({ records: recordsData })
  } catch (error) {
    console.error('Get borrow records error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
