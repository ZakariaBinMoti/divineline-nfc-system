import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Bracelet } from '@/lib/models/Bracelet'
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

  if (!file) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 })
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

  const validDocs: any[] = []
  const errors: string[] = []
  const duplicates: string[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const bracelet_code = (row['bracelet_code'] || row['Bracelet_Code'] || row['BRACELET_CODE'] || row['code'] || row['Code'] || '').toString().trim().toUpperCase()
    const category = (row['category'] || row['Category'] || row['CATEGORY'] || '').toString().trim().toLowerCase()

    if (!bracelet_code || !category) {
      errors.push(`Row ${i + 2}: Missing 'bracelet_code' or 'category'`)
      continue
    }

    const validCategories = ['identity', 'healing', 'no-fear', 'kids']
    if (!validCategories.includes(category)) {
      errors.push(`Row ${i + 2}: Invalid category '${category}'. Use: ${validCategories.join(', ')}`)
      continue
    }

    // Remove duplicate check from db since we will delete all anyway
    validDocs.push({
      bracelet_code,
      category,
      status: 'active',
    })
  }

  if (validDocs.length > 0) {
    // Delete all existing records
    await Bracelet.deleteMany({})
    await Bracelet.insertMany(validDocs)
  }

  return NextResponse.json({
    success: true,
    inserted: validDocs.length,
    skippedDuplicates: duplicates,
    skippedErrors: errors,
  })
}
