import { supabase } from './supabaseClient'

/**
 * Upload file to Supabase Storage
 * @param {string} bucket - Storage bucket name (resumes, projects, avatars)
 * @param {string} path - File path in bucket
 * @param {File} file - The file to upload
 * @returns {Promise<string>} - Storage path of uploaded file
 */
export async function uploadFile(bucket, path, file) {
  try {
    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      throw new Error(`Upload failed: ${error.message}`)
    }

    return data.path
  } catch (error) {
    console.error('File upload error:', error)
    throw error
  }
}

/**
 * Get public URL for a file in Supabase Storage
 * @param {string} bucket - Storage bucket name
 * @param {string} path - File path in bucket
 * @returns {string} - Public URL of the file
 */
export function getPublicUrl(bucket, path) {
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)
  
  return publicUrl
}

/**
 * Delete file from Supabase Storage
 * @param {string} bucket - Storage bucket name
 * @param {string} path - File path in bucket
 */
export async function deleteFile(bucket, path) {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      throw new Error(`Delete failed: ${error.message}`)
    }
  } catch (error) {
    console.error('File delete error:', error)
    throw error
  }
}

/**
 * Generate unique file path for resumes
 * @param {string} userId - User ID
 * @param {string} filename - Original filename
 * @returns {string} - Unique file path
 */
export function generateResumePath(userId, filename) {
  const extension = filename.split('.').pop()
  return `${userId}/resume.${extension}`
}

/**
 * Generate unique file path for projects
 * @param {string} userId - User ID
 * @param {string} projectId - Project ID
 * @param {string} filename - Original filename
 * @returns {string} - Unique file path
 */
export function generateProjectPath(userId, projectId, filename) {
  const extension = filename.split('.').pop()
  const timestamp = Date.now()
  return `${userId}/${projectId}/${timestamp}_${filename}`
}

/**
 * Generate unique file path for avatars
 * @param {string} userId - User ID
 * @param {string} filename - Original filename
 * @returns {string} - Unique file path
 */
export function generateAvatarPath(userId, filename) {
  const extension = filename.split('.').pop()
  return `${userId}/avatar.${extension}`
}
