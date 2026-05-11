import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Bracelet } from '@/lib/models/Bracelet'
import Papa from 'papaparse'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return new NextResponse('Unauthorized', { status: 401 })

  await connectDB()

  const bracelets = await Bracelet.find().lean()
  
  const data = bracelets.map((b: any) => ({
    bracelet_code: b.bracelet_code,
    category: b.category,
    status: b.status
  }))

  const csv = Papa.unparse(data)

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="all_bracelets_export.csv"',
    },
  })
}
