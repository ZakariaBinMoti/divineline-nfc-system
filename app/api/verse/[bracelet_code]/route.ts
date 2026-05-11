import { NextResponse } from 'next/server'
import { getNextVerseForBracelet } from '@/lib/verse-engine'
import { getCategoryFromCode } from '@/lib/category'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ bracelet_code: string }> }
) {
  const { bracelet_code } = await params

  const category = getCategoryFromCode(bracelet_code)
  if (!category) {
    return NextResponse.json({ error: 'Invalid bracelet code' }, { status: 400 })
  }

  try {
    const result = await getNextVerseForBracelet(bracelet_code)

    if (!result) {
      return NextResponse.json(
        { error: 'No verses available for this bracelet' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      verse: result.verse,
      cycleReset: result.isReset,
    })
  } catch (error) {
    console.error('Verse fetch error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
