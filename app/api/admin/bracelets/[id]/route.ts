import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Bracelet } from '@/lib/models/Bracelet'

async function checkAuth() {
  const session = await getServerSession(authOptions)
  return !!session
}

// PUT /api/admin/bracelets/[id]
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const { id } = await params
  const body = await req.json()

  const updateData: Record<string, any> = {}
  if (body.status !== undefined) updateData.status = body.status
  if (body.category !== undefined) updateData.category = body.category

  const bracelet = await Bracelet.findByIdAndUpdate(id, updateData, { new: true })
  if (!bracelet) return NextResponse.json({ error: 'Bracelet not found' }, { status: 404 })

  return NextResponse.json(bracelet)
}

// DELETE /api/admin/bracelets/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const { id } = await params
  await Bracelet.findByIdAndDelete(id)
  return NextResponse.json({ success: true })
}
