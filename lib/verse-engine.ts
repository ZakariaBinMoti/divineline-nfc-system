import { connectDB } from './db'
import { getCategoryFromCode } from './category'
import { Bracelet } from './models/Bracelet'
import { Verse, IVerse } from './models/Verse'
import { BraceletVerseHistory } from './models/BraceletVerseHistory'

export async function getNextVerseForBracelet(braceletCode: string): Promise<{
  verse: IVerse
  isReset: boolean
} | null> {
  await connectDB()

  const category = getCategoryFromCode(braceletCode)
  if (!category) return null

  // Ensure bracelet exists (auto-create if needed)
  let bracelet = await Bracelet.findOne({ bracelet_code: braceletCode })
  if (!bracelet) {
    bracelet = await Bracelet.create({
      bracelet_code: braceletCode,
      category,
      status: 'active',
    })
  }

  if (bracelet.status !== 'active') return null

  // Get all active verse IDs for this category
  const allVerses = await Verse.find({ category, active: true }).select('_id')
  if (allVerses.length === 0) return null

  const allVerseIds = allVerses.map((v) => v._id.toString())

  // Get already shown verse IDs for this bracelet
  const shownHistory = await BraceletVerseHistory.find({
    bracelet_code: braceletCode,
  }).sort({ shown_at: -1 })

  const shownIds = new Set(shownHistory.map((h) => h.verse_id.toString()))

  // Find remaining (not yet shown) verses
  let remainingIds = allVerseIds.filter((id) => !shownIds.has(id))

  let isReset = false

  // If no remaining verses, reset the cycle
  if (remainingIds.length === 0) {
    await BraceletVerseHistory.deleteMany({ bracelet_code: braceletCode })
    remainingIds = allVerseIds
    isReset = true
  }

  // Pick a random verse from remaining pool
  const randomIndex = Math.floor(Math.random() * remainingIds.length)
  const selectedId = remainingIds[randomIndex]

  // Record this verse as shown
  await BraceletVerseHistory.create({
    bracelet_code: braceletCode,
    verse_id: selectedId,
  })

  // Fetch full verse details
  const verse = await Verse.findById(selectedId)
  if (!verse) return null

  return { verse, isReset }
}
