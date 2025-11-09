import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../../firebase/firebase';

/**
 * Upload a single photo to Firebase Storage
 * @param {File} file - The image file to upload
 * @param {string} jobId - The job ID to organize photos
 * @param {string} userId - The user ID for organization
 * @returns {Promise<Object>} Object containing url, name, size, and uploadedAt
 */
export const uploadJobPhoto = async (file, jobId, userId) => {
  try {
    // Create a unique filename
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${sanitizedFileName}`;
    
    // Create storage reference
    const storageRef = ref(storage, `users/${userId}/jobs/${jobId}/photos/${fileName}`);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const url = await getDownloadURL(snapshot.ref);
    
    return {
      url,
      name: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
      path: snapshot.ref.fullPath
    };
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw new Error(`Failed to upload photo: ${error.message}`);
  }
};

/**
 * Upload multiple photos to Firebase Storage
 * @param {Array<File>} files - Array of image files to upload
 * @param {string} jobId - The job ID to organize photos
 * @param {string} userId - The user ID for organization
 * @param {Function} onProgress - Optional callback for progress updates
 * @returns {Promise<Array<Object>>} Array of photo objects with urls
 */
export const uploadMultipleJobPhotos = async (files, jobId, userId, onProgress) => {
  const uploadedPhotos = [];
  const totalFiles = files.length;
  
  for (let i = 0; i < files.length; i++) {
    try {
      const photo = await uploadJobPhoto(files[i], jobId, userId);
      uploadedPhotos.push(photo);
      
      if (onProgress) {
        onProgress({
          current: i + 1,
          total: totalFiles,
          percentage: ((i + 1) / totalFiles) * 100
        });
      }
    } catch (error) {
      console.error(`Failed to upload file ${files[i].name}:`, error);
      // Continue with other uploads even if one fails
    }
  }
  
  return uploadedPhotos;
};

/**
 * Delete a photo from Firebase Storage
 * @param {string} photoPath - The full path to the photo in Firebase Storage
 * @returns {Promise<void>}
 */
export const deleteJobPhoto = async (photoPath) => {
  try {
    const photoRef = ref(storage, photoPath);
    await deleteObject(photoRef);
  } catch (error) {
    console.error('Error deleting photo:', error);
    throw new Error(`Failed to delete photo: ${error.message}`);
  }
};

/**
 * Delete multiple photos from Firebase Storage
 * @param {Array<string>} photoPaths - Array of photo paths to delete
 * @returns {Promise<Array>} Array of results (success/failure for each)
 */
export const deleteMultipleJobPhotos = async (photoPaths) => {
  const results = await Promise.allSettled(
    photoPaths.map(path => deleteJobPhoto(path))
  );
  
  return results.map((result, index) => ({
    path: photoPaths[index],
    success: result.status === 'fulfilled',
    error: result.status === 'rejected' ? result.reason : null
  }));
};

/**
 * Compress an image file before upload (optional optimization)
 * @param {File} file - The image file to compress
 * @param {number} maxWidth - Maximum width in pixels
 * @param {number} maxHeight - Maximum height in pixels
 * @param {number} quality - Quality from 0 to 1
 * @returns {Promise<File>} Compressed image file
 */
export const compressImage = async (file, maxWidth = 1920, maxHeight = 1920, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};