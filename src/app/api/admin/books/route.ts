import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()

    if (!session || session.user.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const books = await prisma.book.findMany({
      include: {
        borrowRecords: {
          where: { status: { in: ['ACTIVE', 'OVERDUE'] } },
          include: { student: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const booksData = books.map((book) => ({
      bookId: book.bookId,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      status: book.status,
      borrowedBy: book.borrowRecords[0]?.student.name || null,
      borrowedByRollNumber: book.borrowRecords[0]?.studentRollNumber || null,
    }))

    return NextResponse.json({ books: booksData })
  } catch (error) {
    console.error('Get books error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { bookId, title, author, isbn } = body

    if (!bookId || !title || !author || !isbn) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if bookId already exists
    const existing = await prisma.book.findUnique({
      where: { bookId },
    })

    if (existing) {
      return NextResponse.json(
        { error: `Book ID '${bookId}' already exists` },
        { status: 400 }
      )
    }

    const book = await prisma.book.create({
      data: {
        bookId,
        title,
        author,
        isbn,
        status: 'AVAILABLE',
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Book added successfully',
        book,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Add book error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
