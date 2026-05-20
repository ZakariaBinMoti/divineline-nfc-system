import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export default cloudinary

export async function uploadImage(
  buffer: Buffer,
  folder: string = 'divineline/backgrounds'
): Promise<{ url: string; publicId: string }> {
  // Convert buffer to base64 data URI for reliable upload
  const base64 = buffer.toString('base64')
  const dataUri = `data:image/png;base64,${base64}`

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: 'image',
    transformation: [
      { width: 1920, height: 1080, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
    ],
  })

  return {
    url: result.secure_url,
    publicId: result.public_id,
  }
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId)
}
