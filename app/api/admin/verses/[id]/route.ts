import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Verse } from '@/lib/models/Verse'

async function checkAuth() {
  const session = await getServerSession(authOptions)
  return !!session
}

// PUT /api/admin/verses/[id]
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const { id } = await params
  const body = await req.json()

  const updateData: Record<string, any> = {}
  if (body.category !== undefined) updateData.category = body.category
  if (body.scripture !== undefined) updateData.scripture = body.scripture
  if (body.reference !== undefined) updateData.reference = body.reference
  if (body.declaration !== undefined) updateData.declaration = body.declaration
  if (body.commentary !== undefined) updateData.commentary = body.commentary
  if (body.active !== undefined) updateData.active = body.active

  const verse = await Verse.findByIdAndUpdate(id, updateData, { new: true })
  if (!verse) return NextResponse.json({ error: 'Verse not found' }, { status: 404 })

  return NextResponse.json(verse)
}

// DELETE /api/admin/verses/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const { id } = await params

  await Verse.findByIdAndDelete(id)

  return NextResponse.json({ success: true })
}
