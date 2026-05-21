import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { AdminUser } from '@/lib/models/AdminUser'

// PUT /api/admin/users/change-password — Change the logged-in admin's password
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const body = await req.json()
  const { currentPassword, newPassword } = body

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Current password and new password are required.' }, { status: 400 })
  }

  if (newPassword.length < 6) {
    return NextResponse.json({ error: 'New password must be at least 6 characters.' }, { status: 400 })
  }

  const adminId = (session as any).adminId
  const admin = await AdminUser.findById(adminId)

  if (!admin) {
    return NextResponse.json({ error: 'Admin user not found.' }, { status: 404 })
  }

  // Verify current password
  const isValid = await admin.comparePassword(currentPassword)
  if (!isValid) {
    return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 403 })
  }

  // Update password (pre-save hook will hash it)
  admin.password = newPassword
  await admin.save()

  return NextResponse.json({ success: true, message: 'Password changed successfully.' })
}
