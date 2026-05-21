import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { SiteSettings, getSettings } from '@/lib/models/SiteSettings'

async function checkAuth() {
  const session = await getServerSession(authOptions)
  return !!session
}

// GET /api/admin/settings
export async function GET() {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const settings = await getSettings()
  return NextResponse.json(settings)
}

// PUT /api/admin/settings
export async function PUT(req: Request) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const body = await req.json()

  const allowedFields = [
    'showReference', 'showScripture', 'showDeclaration', 'showCommentary',
    'backgroundMode', 'solidColor',
    'overlayColor', 'overlayOpacity', 'overlayBlur', 'textColor',
  ]

  const update: Record<string, unknown> = {}
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      update[field] = body[field]
    }
  }

  const settings = await SiteSettings.findOneAndUpdate(
    { key: 'global' },
    { $set: update },
    { returnDocument: 'after', upsert: true }
  )

  return NextResponse.json(settings)
}
