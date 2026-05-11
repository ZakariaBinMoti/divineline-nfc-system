import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Verse } from '@/lib/models/Verse'

async function checkAuth() {
  const session = await getServerSession(authOptions)
  return !!session
}

// GET /api/admin/verses?category=identity
export async function GET(req: Request) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')

  const filter = category ? { category } : {}
  const verses = await Verse.find(filter).sort({ created_at: -1 })

  return NextResponse.json(verses)
}

// POST /api/admin/verses
export async function POST(req: Request) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const body = await req.json()
  const { category, scripture, reference, declaration, commentary } = body

  if (!category || !scripture || !reference) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const verse = await Verse.create({
    category,
    scripture,
    reference,
    declaration: declaration || '',
    commentary: commentary || '',
  })

  return NextResponse.json(verse, { status: 201 })
}
