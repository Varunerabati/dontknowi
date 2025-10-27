import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  req: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const session = await auth()

    if (!session || session.user.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { title, author, isbn } = body

    if (!title || !author || !isbn) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const book = await prisma.book.findUnique({
      where: { bookId: params.bookId },
    })

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    await prisma.book.update({
      where: { bookId: params.bookId },
      data: { title, author, isbn },
    })

    return NextResponse.json({
      success: true,
      message: 'Book updated successfully',
    })
  } catch (error) {
    console.error('Update book error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const session = await auth()

    if (!session || session.user.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const book = await prisma.book.findUnique({
      where: { bookId: params.bookId },
      include: {
        borrowRecords: {
          where: { status: { in: ['ACTIVE', 'OVERDUE'] } },
          include: { student: true },
        },
      },
    })

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    if (book.status === 'BORROWED' || book.borrowRecords.length > 0) {
      const studentName = book.borrowRecords[0]?.student.name
      return NextResponse.json(
        { error: `Cannot delete book. It is currently borrowed by ${studentName}` },
        { status: 400 }
      )
    }

    await prisma.book.delete({
      where: { bookId: params.bookId },
    })

    return NextResponse.json({
      success: true,
      message: 'Book deleted successfully',
    })
  } catch (error) {
    console.error('Delete book error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
