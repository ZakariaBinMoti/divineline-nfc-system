import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { getSettings } from '@/lib/models/SiteSettings'

// GET /api/settings — public endpoint for customer-facing pages
export async function GET() {
  await connectDB()
  const settings = await getSettings()

  return NextResponse.json({
    showReference: settings.showReference,
    showScripture: settings.showScripture,
    showDeclaration: settings.showDeclaration,
    showCommentary: settings.showCommentary,
    backgroundMode: settings.backgroundMode,
    solidColor: settings.solidColor,
    backgroundImages: settings.backgroundImages,
  })
}
