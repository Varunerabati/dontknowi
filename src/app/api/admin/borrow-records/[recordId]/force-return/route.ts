import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: { recordId: string } }
) {
  try {
    const session = await auth()

    if (!session || session.user.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const recordId = parseInt(params.recordId)

    const record = await prisma.borrowRecord.findUnique({
      where: { recordId },
      include: { book: true },
    })

    if (!record) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 })
    }

    if (record.status === 'RETURNED') {
      return NextResponse.json(
        { error: 'This book has already been returned' },
        { status: 400 }
      )
    }

    // Update record and book status in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.borrowRecord.update({
        where: { recordId },
        data: {
          returnDate: new Date(),
          status: 'RETURNED',
        },
      })

      await tx.book.update({
        where: { bookId: record.bookId },
        data: { status: 'AVAILABLE' },
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Book returned successfully',
    })
  } catch (error) {
    console.error('Force return error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
