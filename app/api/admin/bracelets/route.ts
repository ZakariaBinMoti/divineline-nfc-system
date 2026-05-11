import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Bracelet } from '@/lib/models/Bracelet'

async function checkAuth() {
  const session = await getServerSession(authOptions)
  return !!session
}

// GET /api/admin/bracelets
export async function GET(req: Request) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')

  const filter = category ? { category } : {}
  const bracelets = await Bracelet.find(filter).sort({ created_at: -1 })

  return NextResponse.json(bracelets)
}

// POST /api/admin/bracelets
export async function POST(req: Request) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const body = await req.json()
  const { bracelet_code, category, status } = body

  if (!bracelet_code || !category) {
    return NextResponse.json({ error: 'Missing bracelet_code or category' }, { status: 400 })
  }

  try {
    const bracelet = await Bracelet.create({
      bracelet_code: bracelet_code.toUpperCase(),
      category,
      status: status || 'active',
    })
    return NextResponse.json(bracelet, { status: 201 })
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Bracelet code already exists' }, { status: 409 })
    }
    throw error
  }
}
