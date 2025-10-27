import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const session = await auth()

    if (!session || session.user.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const students = await prisma.student.findMany({
      include: {
        borrowRecords: {
          where: { status: { in: ['ACTIVE', 'OVERDUE'] } },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const studentsData = students.map((student) => ({
      rollNumber: student.rollNumber,
      name: student.name,
      email: student.email,
      department: student.department,
      activeBorrows: student.borrowRecords.length,
    }))

    return NextResponse.json({ students: studentsData })
  } catch (error) {
    console.error('Get students error:', error)
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
    const { rollNumber, name, email, department, password } = body

    if (!rollNumber || !name || !email || !department || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if roll number already exists
    const existing = await prisma.student.findUnique({
      where: { rollNumber },
    })

    if (existing) {
      return NextResponse.json(
        { error: `Roll Number '${rollNumber}' already exists` },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const student = await prisma.student.create({
      data: {
        rollNumber,
        name,
        email,
        department,
        password: hashedPassword,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: `Student added successfully. Roll Number: ${rollNumber}, Password: ${password}`,
        student: {
          rollNumber: student.rollNumber,
          name: student.name,
          email: student.email,
          department: student.department,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Add student error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
