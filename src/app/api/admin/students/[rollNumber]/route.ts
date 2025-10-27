import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { rollNumber: string } }
) {
  try {
    const session = await auth()

    if (!session || session.user.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const student = await prisma.student.findUnique({
      where: { rollNumber: params.rollNumber },
      include: {
        borrowRecords: {
          include: { book: true },
          orderBy: { borrowedDate: 'desc' },
        },
      },
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    const borrowHistory = student.borrowRecords.map((record) => ({
      recordId: record.recordId,
      bookId: record.book.bookId,
      bookTitle: record.book.title,
      borrowedDate: record.borrowedDate.toISOString(),
      dueDate: record.dueDate.toISOString(),
      returnDate: record.returnDate?.toISOString() || null,
      status: record.status,
    }))

    return NextResponse.json({
      student: {
        rollNumber: student.rollNumber,
        name: student.name,
        email: student.email,
        department: student.department,
      },
      borrowHistory,
    })
  } catch (error) {
    console.error('Get student details error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { rollNumber: string } }
) {
  try {
    const session = await auth()

    if (!session || session.user.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, email, department } = body

    if (!name || !email || !department) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const student = await prisma.student.findUnique({
      where: { rollNumber: params.rollNumber },
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    await prisma.student.update({
      where: { rollNumber: params.rollNumber },
      data: { name, email, department },
    })

    return NextResponse.json({
      success: true,
      message: 'Student updated successfully',
    })
  } catch (error) {
    console.error('Update student error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { rollNumber: string } }
) {
  try {
    const session = await auth()

    if (!session || session.user.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const student = await prisma.student.findUnique({
      where: { rollNumber: params.rollNumber },
      include: {
        borrowRecords: {
          where: { status: { in: ['ACTIVE', 'OVERDUE'] } },
        },
      },
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    if (student.borrowRecords.length > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete student. They have ${student.borrowRecords.length} active borrowed book(s). Please return all books first`,
        },
        { status: 400 }
      )
    }

    await prisma.student.delete({
      where: { rollNumber: params.rollNumber },
    })

    return NextResponse.json({
      success: true,
      message: 'Student deleted successfully',
    })
  } catch (error) {
    console.error('Delete student error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
