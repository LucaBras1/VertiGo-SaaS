import { v2 as cloudinary, UploadApiResponse } from 'cloudinary'

// Lazy initialization to avoid build-time errors
let _cloudinaryConfigured = false

function configureCloudinary() {
  if (_cloudinaryConfigured) return

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    console.warn('[Cloudinary] Missing environment variables - photo upload will fail at runtime')
    return
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  })

  _cloudinaryConfigured = true
}

export interface UploadResult {
  url: string
  thumbnailUrl: string
  publicId: string
  width: number
  height: number
  format: string
  bytes: number
}

export interface UploadOptions {
  folder?: string
  tags?: string[]
  context?: Record<string, string>
}

/**
 * Upload a photo to Cloudinary
 */
export async function uploadPhoto(
  file: Buffer | string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  configureCloudinary()

  if (!_cloudinaryConfigured) {
    throw new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.')
  }

  const { folder = 'shootflow', tags = [], context = {} } = options

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const uploadOptions = {
      folder,
      tags,
      context: Object.entries(context).map(([k, v]) => `${k}=${v}`).join('|'),
      resource_type: 'image' as const,
      transformation: [
        { quality: 'auto:best', fetch_format: 'auto' }
      ]
    }

    if (typeof file === 'string' && file.startsWith('data:')) {
      // Base64 data URL
      cloudinary.uploader.upload(file, uploadOptions, (error, result) => {
        if (error) reject(error)
        else if (result) resolve(result)
        else reject(new Error('No result returned from Cloudinary'))
      })
    } else if (Buffer.isBuffer(file)) {
      // Buffer upload
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) reject(error)
          else if (result) resolve(result)
          else reject(new Error('No result returned from Cloudinary'))
        }
      )
      uploadStream.end(file)
    } else {
      reject(new Error('Invalid file type. Expected Buffer or base64 data URL.'))
    }
  })

  // Generate thumbnail URL (300px wide)
  const thumbnailUrl = cloudinary.url(result.public_id, {
    width: 300,
    height: 300,
    crop: 'fill',
    gravity: 'auto',
    quality: 'auto',
    fetch_format: 'auto'
  })

  return {
    url: result.secure_url,
    thumbnailUrl,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes
  }
}

/**
 * Delete a photo from Cloudinary
 */
export async function deletePhoto(publicId: string): Promise<void> {
  configureCloudinary()

  if (!_cloudinaryConfigured) {
    throw new Error('Cloudinary is not configured.')
  }

  await cloudinary.uploader.destroy(publicId)
}

/**
 * Delete multiple photos from Cloudinary
 */
export async function deletePhotos(publicIds: string[]): Promise<void> {
  configureCloudinary()

  if (!_cloudinaryConfigured) {
    throw new Error('Cloudinary is not configured.')
  }

  if (publicIds.length === 0) return

  await cloudinary.api.delete_resources(publicIds)
}

/**
 * Get optimized URL for a photo
 */
export function getOptimizedUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    quality?: string | number
    format?: string
  } = {}
): string {
  configureCloudinary()

  const { width, height, quality = 'auto', format = 'auto' } = options

  return cloudinary.url(publicId, {
    width,
    height,
    crop: width && height ? 'fill' : 'scale',
    gravity: 'auto',
    quality,
    fetch_format: format
  })
}

/**
 * Generate signed upload URL for client-side upload
 */
export function generateUploadSignature(
  folder: string,
  tags: string[] = []
): { signature: string; timestamp: number; apiKey: string; cloudName: string } {
  configureCloudinary()

  if (!_cloudinaryConfigured) {
    throw new Error('Cloudinary is not configured.')
  }

  const timestamp = Math.round(Date.now() / 1000)
  const paramsToSign = {
    timestamp,
    folder,
    tags: tags.join(',')
  }

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET!
  )

  return {
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!
  }
}
