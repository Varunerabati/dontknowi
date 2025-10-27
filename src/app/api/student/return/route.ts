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
    const { recordId } = body

    if (!recordId) {
      return NextResponse.json(
        { error: 'Record ID is required' },
        { status: 400 }
      )
    }

    const studentRollNumber = session.user.id

    // Find the borrow record
    const record = await prisma.borrowRecord.findUnique({
      where: { recordId: parseInt(recordId) },
      include: { book: true },
    })

    if (!record) {
      return NextResponse.json(
        { error: 'Borrow record not found' },
        { status: 404 }
      )
    }

    // Verify record belongs to the student
    if (record.studentRollNumber !== studentRollNumber) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if already returned
    if (record.status === 'RETURNED') {
      return NextResponse.json(
        { error: 'This book has already been returned' },
        { status: 400 }
      )
    }

    // Update record and book status in a transaction
    await prisma.$transaction(async (tx) => {
      // Update borrow record
      await tx.borrowRecord.update({
        where: { recordId: parseInt(recordId) },
        data: {
          returnDate: new Date(),
          status: 'RETURNED',
        },
      })

      // Update book status
      await tx.book.update({
        where: { bookId: record.bookId },
        data: { status: 'AVAILABLE' },
      })
    })

    return NextResponse.json({
      success: true,
      message: `Book '${record.book.title}' returned successfully`,
    })
  } catch (error) {
    console.error('Return book error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
