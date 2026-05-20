import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { SiteSettings } from '@/lib/models/SiteSettings'
import { uploadImage, deleteImage } from '@/lib/cloudinary'

async function checkAuth() {
  const session = await getServerSession(authOptions)
  return !!session
}

// POST /api/admin/backgrounds — upload a new background image
export async function POST(req: Request) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Check Cloudinary config
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Missing Cloudinary credentials in .env.local')
      return NextResponse.json({ error: 'Cloudinary is not configured. Add credentials to .env.local' }, { status: 500 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    console.log(`Uploading image: ${file.name} (${(buffer.length / 1024).toFixed(1)} KB)`)

    const { url, publicId } = await uploadImage(buffer)

    console.log(`Upload success: ${publicId}`)

    // Add to SiteSettings
    await SiteSettings.findOneAndUpdate(
      { key: 'global' },
      { $push: { backgroundImages: { url, publicId } } },
      { upsert: true }
    )

    return NextResponse.json({ url, publicId }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    const stack = error instanceof Error ? error.stack : ''
    console.error('Background upload error:', message)
    console.error('Stack:', stack)
    return NextResponse.json({ error: `Upload failed: ${message}` }, { status: 500 })
  }
}

// DELETE /api/admin/backgrounds — remove a background image
export async function DELETE(req: Request) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()

  try {
    const { publicId } = await req.json()

    if (!publicId) {
      return NextResponse.json({ error: 'publicId required' }, { status: 400 })
    }

    // Delete from Cloudinary
    await deleteImage(publicId)

    // Remove from SiteSettings
    await SiteSettings.findOneAndUpdate(
      { key: 'global' },
      { $pull: { backgroundImages: { publicId } } }
    )

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Background delete error:', message)
    return NextResponse.json({ error: `Delete failed: ${message}` }, { status: 500 })
  }
}
