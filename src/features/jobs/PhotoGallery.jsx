import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

const PhotoGallery = ({ 
  photos = [], 
  compact = false,
  maxVisible = 4,
  isDarkMode,
  colors 
}) => {
  const [fullscreenIndex, setFullscreenIndex] = useState(null);

  if (!photos || photos.length === 0) return null;

  const handleOpenFullscreen = (index) => {
    setFullscreenIndex(index);
    // Prevent body scroll when fullscreen is open
    document.body.style.overflow = 'hidden';
  };

  const handleCloseFullscreen = () => {
    setFullscreenIndex(null);
    // Restore body scroll
    document.body.style.overflow = '';
  };

  const handlePrevious = (e) => {
    e.stopPropagation();
    setFullscreenIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setFullscreenIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  const handleKeyDown = (e) => {
    if (fullscreenIndex === null) return;
    
    if (e.key === 'Escape') {
      handleCloseFullscreen();
    } else if (e.key === 'ArrowLeft') {
      handlePrevious(e);
    } else if (e.key === 'ArrowRight') {
      handleNext(e);
    }
  };

  // Add keyboard listener
  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullscreenIndex]);

  const visiblePhotos = compact ? photos.slice(0, maxVisible) : photos;
  const remainingCount = photos.length - maxVisible;

  return (
    <>
      {/* Photo Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: compact 
          ? `repeat(auto-fill, minmax(60px, 1fr))`
          : `repeat(auto-fill, minmax(120px, 1fr))`,
        gap: compact ? '0.375rem' : '0.5rem',
        marginTop: compact ? '0.5rem' : '0'
      }}>
        {visiblePhotos.map((photo, index) => (
          <div
            key={index}
            onClick={() => handleOpenFullscreen(index)}
            style={{
              position: 'relative',
              paddingTop: '100%', // Square aspect ratio
              background: colors.bg,
              borderRadius: '0.375rem',
              overflow: 'hidden',
              cursor: 'pointer',
              border: `1px solid ${colors.border}`,
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
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
            
            {/* Show remaining count on last visible photo in compact mode */}
            {compact && index === maxVisible - 1 && remainingCount > 0 && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                +{remainingCount}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Fullscreen Modal */}
      {fullscreenIndex !== null && (
        <div
          onClick={handleCloseFullscreen}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.95)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {/* Close button */}
          <button
            onClick={handleCloseFullscreen}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              zIndex: 10000,
              backdropFilter: 'blur(10px)'
            }}
          >
            <X size={24} />
          </button>

          {/* Image counter */}
          <div style={{
            position: 'absolute',
            top: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '1rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            zIndex: 10000
          }}>
            {fullscreenIndex + 1} / {photos.length}
          </div>

          {/* Previous button */}
          {photos.length > 1 && (
            <button
              onClick={handlePrevious}
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                zIndex: 10000,
                backdropFilter: 'blur(10px)'
              }}
            >
              <ChevronLeft size={28} />
            </button>
          )}

          {/* Next button */}
          {photos.length > 1 && (
            <button
              onClick={handleNext}
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                zIndex: 10000,
                backdropFilter: 'blur(10px)'
              }}
            >
              <ChevronRight size={28} />
            </button>
          )}

          {/* Current image */}
          <img
            src={photos[fullscreenIndex].url || photos[fullscreenIndex].preview}
            alt={`Photo ${fullscreenIndex + 1}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              borderRadius: '0.5rem'
            }}
          />

          {/* Photo name (if available) */}
          {photos[fullscreenIndex].name && (
            <div style={{
              position: 'absolute',
              bottom: '1rem',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              maxWidth: '90%',
              textAlign: 'center',
              zIndex: 10000
            }}>
              {photos[fullscreenIndex].name}
            </div>
          )}
        </div>
      )}

      {/* Animation */}
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
        `}
      </style>
    </>
  );
};

export default PhotoGallery;