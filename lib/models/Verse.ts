import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IVerse extends Document {
  category: string
  scripture: string
  reference: string
  declaration: string
  commentary: string
  active: boolean
  created_at: Date
}

const VerseSchema = new Schema<IVerse>({
  category: { type: String, required: true, index: true },
  scripture: { type: String, required: true },
  reference: { type: String, required: true },
  declaration: { type: String, default: '' },
  commentary: { type: String, default: '' },
  active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
})

export const Verse: Model<IVerse> =
  mongoose.models.Verse || mongoose.model<IVerse>('Verse', VerseSchema)
