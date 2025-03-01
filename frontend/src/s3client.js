import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PHOTO_BUCKET } from '../constants'
import imageCompression from 'browser-image-compression'
import { max } from 'lodash'

// Configure S3 client
const s3Client = new S3Client({
  region: import.meta.env.VITE_AWS_REGION,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
})
export async function uploadPhotos(path, filesRef) {
  const uploadPromises = Array.from(filesRef).map(async (file) => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: 'image/webp',
    }

    try {
      const compressedFile = await imageCompression(file, options)
      console.log('COMPRESSED FILE: ', compressedFile)
      const dotIndex = file.name.lastIndexOf('.')
      let newName
      if (dotIndex !== -1) {
        newName = file.name.substring(0, dotIndex)
      } else {
        newName = file.name
      }
      console.log(dotIndex, newName)
      const webpFile = new File([compressedFile], `${newName}.webp`, { type: 'image/webp' })
      console.log('PATHS ARE HERE: ', `${path}/${webpFile.name}`)
      const arrayBuffer = await webpFile.arrayBuffer()
      const params = {
        Bucket: PHOTO_BUCKET,
        Key: `${path}/${webpFile.name}`,
        Body: arrayBuffer,
        ContentType: webpFile.type,
      }

      await s3Client.send(new PutObjectCommand(params))
      return `https://${PHOTO_BUCKET}.s3.${import.meta.env.VITE_AWS_REGION}.amazonaws.com/${params.Key}`
    } catch (error) {
      console.error('Error uploading files to S3:', error)
      return false
    }
  })
  console.log(uploadPromises)
  const fileURLS = await Promise.all(uploadPromises)
  return fileURLS
}

/**
 * Retrieve pre-signed URLs for all photos in a directory in S3.
 * @param {string} bucketName - The name of the S3 bucket.
 * @param {string} prefix - The directory key (path) in the S3 bucket.
 * @returns {Promise<string[]>} - An array of pre-signed URLs for the photos.
 */
export async function getPhotos(prefix) {
  try {
    // List all objects in the directory
    const params = { Bucket: PHOTO_BUCKET, Prefix: prefix }
    const command = new ListObjectsV2Command(params)
    console.log(command)
    const data = await s3Client.send(command)

    if (!data.Contents || data.Contents.length === 0) {
      console.log('No photos found in the directory.')
      return []
    }

    // Generate pre-signed URLs for each object
    const signedUrls = await Promise.all(
      data.Contents.map(async (item) => {
        const getObjectParams = { Bucket: PHOTO_BUCKET, Key: item.Key }
        const getObjectCommand = new GetObjectCommand(getObjectParams)
        return getSignedUrl(s3Client, getObjectCommand, { expiresIn: 3600 }) // URL expires in 1 hour
      }),
    )

    return signedUrls
  } catch (error) {
    console.error('Error retrieving photos from S3:', error)
    return []
  }
}

/**
 * Get the first photo from an S3 bucket given a prefix.
 * @param {string} bucket - The name of the S3 bucket.
 * @param {string} prefix - The prefix (directory) to search for photos.
 * @returns {Promise<string>} - A pre-signed URL for the first photo.
 */
export async function getFirstPhoto(prefix) {
  try {
    // List all objects in the directory
    const params = { Bucket: PHOTO_BUCKET, Prefix: prefix, MaxKeys: 1 }
    const command = new ListObjectsV2Command(params)
    const data = await s3Client.send(command)

    if (!data.Contents || data.Contents.length === 0) {
      console.log('No photos found in the directory.')
      return null
    }

    // Generate pre-signed URL for the first object
    const getObjectParams = { Bucket: PHOTO_BUCKET, Key: data.Contents[0].Key }
    const getObjectCommand = new GetObjectCommand(getObjectParams)
    const signedUrl = await getSignedUrl(s3Client, getObjectCommand, { expiresIn: 3600 }) // URL expires in 1 hour

    return signedUrl
  } catch (error) {
    console.error('Error retrieving the first photo from S3:', error)
    return null
  }
}
