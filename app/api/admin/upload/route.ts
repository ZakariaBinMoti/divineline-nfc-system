import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Verse } from '@/lib/models/Verse'
import * as XLSX from 'xlsx'

async function checkAuth() {
  const session = await getServerSession(authOptions)
  return !!session
}

export async function POST(req: Request) {
  if (!(await checkAuth())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()

  const formData = await req.formData()
  const file = formData.get('file') as File
  const category = formData.get('category') as string

  if (!file || !category) {
    return NextResponse.json({ error: 'Missing file or category' }, { status: 400 })
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  let rows: any[] = []
  const fileName = file.name.toLowerCase()

  if (fileName.endsWith('.csv') || fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    rows = XLSX.utils.sheet_to_json(sheet)
  } else {
    return NextResponse.json({ error: 'Unsupported file type. Use CSV or XLSX.' }, { status: 400 })
  }

  // Expected columns: scripture, reference, declaration, commentary
  const validDocs: any[] = []
  const errors: string[] = []

  rows.forEach((row: any, index: number) => {
    const scripture = row['scripture'] || row['Scripture'] || row['SCRIPTURE']
    const reference = row['reference'] || row['Reference'] || row['REFERENCE']
    const rowCategory = row['category'] || row['Category'] || row['CATEGORY'] || category

    if (!scripture || !reference) {
      errors.push(`Row ${index + 2}: Missing 'scripture' or 'reference'`)
      return
    }

    validDocs.push({
      category: rowCategory,
      scripture: String(scripture).trim(),
      reference: String(reference).trim(),
      declaration: String(row['declaration'] || row['Declaration'] || '').trim(),
      commentary: String(row['commentary'] || row['Commentary'] || '').trim(),
      active: true,
    })
  })

  if (validDocs.length === 0) {
    return NextResponse.json({ error: 'No valid rows found', errors }, { status: 400 })
  }

  // Delete all existing records
  await Verse.deleteMany({})
  await Verse.insertMany(validDocs)

  return NextResponse.json({
    success: true,
    inserted: validDocs.length,
    skippedErrors: errors,
  })
}
