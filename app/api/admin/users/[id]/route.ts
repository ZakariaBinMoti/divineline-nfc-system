import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { AdminUser } from '@/lib/models/AdminUser'

// DELETE /api/admin/users/[id] — Delete an admin user
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const { id } = await params

  // Prevent deleting the last admin
  const adminCount = await AdminUser.countDocuments()
  if (adminCount <= 1) {
    return NextResponse.json(
      { error: 'Cannot delete the last admin. At least one admin must exist.' },
      { status: 403 }
    )
  }

  // Prevent self-deletion
  const currentAdminId = (session as any).adminId
  if (currentAdminId === id) {
    return NextResponse.json(
      { error: 'You cannot delete your own account while logged in.' },
      { status: 403 }
    )
  }

  // Prevent deleting the superadmin
  const targetAdmin = await AdminUser.findById(id)
  if (!targetAdmin) {
    return NextResponse.json({ error: 'Admin not found.' }, { status: 404 })
  }

  const superAdminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase()
  if (targetAdmin.email.toLowerCase() === superAdminEmail) {
    return NextResponse.json(
      { error: 'Cannot delete the Super Admin account.' },
      { status: 403 }
    )
  }

  await AdminUser.findByIdAndDelete(id)

  return NextResponse.json({ success: true })
}
