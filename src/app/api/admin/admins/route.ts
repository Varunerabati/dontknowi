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

    const admins = await prisma.admin.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        adminId: true,
        name: true,
        email: true,
      },
    })

    return NextResponse.json({ admins })
  } catch (error) {
    console.error('Get admins error:', error)
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
    const { adminId, name, email, password } = body

    if (!adminId || !name || !email || !password) {
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

    const existing = await prisma.admin.findUnique({
      where: { adminId },
    })

    if (existing) {
      return NextResponse.json(
        { error: `Admin ID '${adminId}' already exists` },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.admin.create({
      data: {
        adminId,
        name,
        email,
        password: hashedPassword,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Admin added successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Add admin error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
