import { connectDB } from '@/lib/db'
import { AdminUser } from '@/lib/models/AdminUser'

/**
 * Ensures at least one admin user exists in the database.
 * If no admins exist, creates one from ADMIN_EMAIL / ADMIN_PASSWORD env vars.
 * This is called automatically during authentication.
 */
export async function ensureDefaultAdmin(): Promise<void> {
  await connectDB()

  const adminCount = await AdminUser.countDocuments()

  if (adminCount > 0) return

  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  if (!email || !password) {
    console.warn(
      '⚠️  No admin users exist and ADMIN_EMAIL/ADMIN_PASSWORD are not set in .env.local. ' +
      'Cannot create default admin.'
    )
    return
  }

  await AdminUser.create({
    email,
    password,
    name: 'Admin',
  })

  console.log(`✅ Default admin created: ${email}`)
}
