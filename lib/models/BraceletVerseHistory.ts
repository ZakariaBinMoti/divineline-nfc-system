import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IBraceletVerseHistory extends Document {
  bracelet_code: string
  verse_id: mongoose.Types.ObjectId
  shown_at: Date
}

const BraceletVerseHistorySchema = new Schema<IBraceletVerseHistory>({
  bracelet_code: { type: String, required: true, index: true },
  verse_id: { type: Schema.Types.ObjectId, ref: 'Verse', required: true },
  shown_at: { type: Date, default: Date.now },
})

// Compound index for efficient lookups
BraceletVerseHistorySchema.index({ bracelet_code: 1, verse_id: 1 })

export const BraceletVerseHistory: Model<IBraceletVerseHistory> =
  mongoose.models.BraceletVerseHistory ||
  mongoose.model<IBraceletVerseHistory>('BraceletVerseHistory', BraceletVerseHistorySchema)
