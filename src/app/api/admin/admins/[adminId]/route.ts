import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  req: NextRequest,
  { params }: { params: { adminId: string } }
) {
  try {
    const session = await auth()

    if (!session || session.user.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, email } = body

    if (!name || !email) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    const admin = await prisma.admin.findUnique({
      where: { adminId: params.adminId },
    })

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    await prisma.admin.update({
      where: { adminId: params.adminId },
      data: { name, email },
    })

    return NextResponse.json({
      success: true,
      message: 'Admin updated successfully',
    })
  } catch (error) {
    console.error('Update admin error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { adminId: string } }
) {
  try {
    const session = await auth()

    if (!session || session.user.type !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const totalAdmins = await prisma.admin.count()

    if (totalAdmins <= 1) {
      return NextResponse.json(
        { error: 'Cannot delete the last admin account' },
        { status: 400 }
      )
    }

    const admin = await prisma.admin.findUnique({
      where: { adminId: params.adminId },
    })

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    await prisma.admin.delete({
      where: { adminId: params.adminId },
    })

    return NextResponse.json({
      success: true,
      message: 'Admin deleted successfully',
    })
  } catch (error) {
    console.error('Delete admin error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
