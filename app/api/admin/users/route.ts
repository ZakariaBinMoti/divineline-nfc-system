import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { AdminUser } from '@/lib/models/AdminUser'

async function checkAuth() {
  const session = await getServerSession(authOptions)
  return session
}

// GET /api/admin/users — List all admin users
export async function GET() {
  const session = await checkAuth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const admins = await AdminUser.find({}, { password: 0 }).sort({ createdAt: 1 })

  return NextResponse.json(admins)
}

// POST /api/admin/users — Create a new admin user
export async function POST(req: Request) {
  const session = await checkAuth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const body = await req.json()
  const { email, password, name } = body

  if (!email || !password || !name) {
    return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 })
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 })
  }

  // Check if email already exists
  const existing = await AdminUser.findOne({ email: email.toLowerCase() })
  if (existing) {
    return NextResponse.json({ error: 'An admin with this email already exists.' }, { status: 409 })
  }

  const admin = await AdminUser.create({
    email: email.toLowerCase(),
    password,
    name,
  })

  return NextResponse.json({
    _id: admin._id,
    email: admin.email,
    name: admin.name,
    createdAt: admin.createdAt,
  }, { status: 201 })
}
