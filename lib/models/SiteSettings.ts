import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ISiteSettings extends Document {
  key: string
  // Column visibility (Feature 3)
  showReference: boolean
  showScripture: boolean
  showDeclaration: boolean
  showCommentary: boolean
  // Background settings (Feature 4)
  backgroundMode: 'solid' | 'images'
  solidColor: string
  backgroundImages: { url: string; publicId: string }[]
  // Overlay settings
  overlayColor: string
  overlayOpacity: number
  overlayBlur: number
  // Text color
  textColor: string
}

const SiteSettingsSchema = new Schema<ISiteSettings>({
  key: { type: String, required: true, unique: true, default: 'global' },
  showReference: { type: Boolean, default: true },
  showScripture: { type: Boolean, default: true },
  showDeclaration: { type: Boolean, default: true },
  showCommentary: { type: Boolean, default: true },
  backgroundMode: { type: String, enum: ['solid', 'images'], default: 'solid' },
  solidColor: { type: String, default: '#FAFAF8' },
  backgroundImages: [{
    url: { type: String, required: true },
    publicId: { type: String, required: true },
  }],
  overlayColor: { type: String, default: '#000000' },
  overlayOpacity: { type: Number, default: 0.4, min: 0.1, max: 0.9 },
  overlayBlur: { type: Number, default: 2, min: 0, max: 10 },
  textColor: { type: String, default: '#FFFFFF' },
})

export const SiteSettings: Model<ISiteSettings> =
  mongoose.models.SiteSettings || mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema)

export async function getSettings(): Promise<ISiteSettings> {
  const settings = await SiteSettings.findOne({ key: 'global' })
  if (settings) return settings
  return SiteSettings.create({ key: 'global' })
}
