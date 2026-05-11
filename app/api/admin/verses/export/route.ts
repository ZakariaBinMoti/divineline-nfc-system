import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Verse } from '@/lib/models/Verse'
import Papa from 'papaparse'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return new NextResponse('Unauthorized', { status: 401 })

  await connectDB()

  const verses = await Verse.find().lean()
  
  const data = verses.map((v: any) => ({
    category: v.category,
    reference: v.reference,
    scripture: v.scripture,
    declaration: v.declaration || '',
    commentary: v.commentary || '',
    active: v.active ? 'yes' : 'no'
  }))

  const csv = Papa.unparse(data)

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="all_verses_export.csv"',
    },
  })
}
