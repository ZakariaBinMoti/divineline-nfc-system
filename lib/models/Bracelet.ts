import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IBracelet extends Document {
  bracelet_code: string
  category: string
  status: string
  created_at: Date
}

const BraceletSchema = new Schema<IBracelet>({
  bracelet_code: { type: String, required: true, unique: true, uppercase: true },
  category: { type: String, required: true },
  status: { type: String, default: 'active' },
  created_at: { type: Date, default: Date.now },
})

export const Bracelet: Model<IBracelet> =
  mongoose.models.Bracelet || mongoose.model<IBracelet>('Bracelet', BraceletSchema)
