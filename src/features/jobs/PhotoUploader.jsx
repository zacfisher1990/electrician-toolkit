import React, { useState } from 'react';
import { Camera, X, Upload, Image as ImageIcon } from 'lucide-react';

const PhotoUploader = ({ 
  photos = [], 
  onPhotosChange, 
  maxPhotos = 10,
  isDarkMode,
  colors 
}) => {
  const [error, setError] = useState(null);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    // Check max photos limit
    if (photos.length + files.length > maxPhotos) {
      setError(`Maximum ${maxPhotos} photos allowed`);
      setTimeout(() => setError(null), 3000);
      return;
    }

    // Validate file types and sizes
    const validFiles = [];
    for (const file of files) {
      // Check if it's an image
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        setTimeout(() => setError(null), 3000);
        continue;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Images must be less than 5MB');
        setTimeout(() => setError(null), 3000);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setError(null);

    try {
      // Create preview URLs for immediate display (this is instant!)
      const newPhotos = validFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        size: file.size
      }));

      // Add to photos array immediately - instant feedback!
      onPhotosChange([...photos, ...newPhotos]);
    } catch (err) {
      console.error('Error handling photos:', err);
      setError('Failed to add photos');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleRemovePhoto = (index) => {
    const newPhotos = [...photos];
    const removedPhoto = newPhotos[index];
    
    // Revoke the preview URL to free memory
    if (removedPhoto.preview) {
      URL.revokeObjectURL(removedPhoto.preview);
    }
    
    newPhotos.splice(index, 1);
    onPhotosChange(newPhotos);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div>
      <label style={{
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: '600',
        color: colors.text,
        marginBottom: '0.5rem'
      }}>
        Photos
        <span style={{ 
          fontSize: '0.75rem', 
          fontWeight: '400', 
          color: colors.subtext,
          marginLeft: '0.5rem'
        }}>
          ({photos.length}/{maxPhotos})
        </span>
      </label>

      {/* Upload Button */}
      {photos.length < maxPhotos && (
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '1rem',
            border: `2px dashed ${colors.border}`,
            borderRadius: '0.5rem',
            background: colors.bg,
            color: colors.text,
            cursor: 'pointer',
            transition: 'all 0.2s',
            marginBottom: '0.75rem'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#3b82f6';
            e.currentTarget.style.background = isDarkMode ? '#1e293b' : '#f1f5f9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = colors.border;
            e.currentTarget.style.background = colors.bg;
          }}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <Camera size={20} />
          <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
            Add Photos
          </span>
        </label>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          padding: '0.75rem',
          background: '#fee2e2',
          color: '#991b1b',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          marginBottom: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
          gap: '0.5rem',
          marginBottom: '0.75rem'
        }}>
          {photos.map((photo, index) => (
            <div
              key={index}
              style={{
                position: 'relative',
                paddingTop: '100%', // Square aspect ratio
                background: colors.bg,
                borderRadius: '0.5rem',
                overflow: 'hidden',
                border: `1px solid ${colors.border}`
              }}
            >
              {/* Image */}
              <img
                src={photo.url || photo.preview}
                alt={`Photo ${index + 1}`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                loading="lazy"
              />

              {/* Remove button */}
              <button
                onClick={() => handleRemovePhoto(index)}
                style={{
                  position: 'absolute',
                  top: '0.25rem',
                  right: '0.25rem',
                  background: 'rgba(0, 0, 0, 0.7)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'white',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.9)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)';
                }}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Helper text */}
      {photos.length === 0 && (
        <p style={{
          fontSize: '0.75rem',
          color: colors.subtext,
          margin: '0.5rem 0 0 0',
          fontStyle: 'italic'
        }}>
          Photos will be uploaded when you save the job
        </p>
      )}
    </div>
  );
};

export default PhotoUploader;