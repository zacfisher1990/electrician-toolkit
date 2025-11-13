import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, User, Mail, Phone, Briefcase, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { 
  getAuth, 
  updateProfile
} from 'firebase/auth';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { 
  doc, 
  updateDoc,
  getDoc 
} from 'firebase/firestore';
import { db } from '../../firebase/firebase';

const EditProfile = ({ isOpen, onClose, isDarkMode, userData, onUpdate }) => {
  const auth = getAuth();
  const storage = getStorage();
  const user = auth.currentUser;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phone: '',
    company: '',
    licenseNumber: ''
  });
  
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  
  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);

  const colors = {
    bg: isDarkMode ? '#000000' : '#f9fafb',
    cardBg: isDarkMode ? '#0a0a0a' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#111827',
    subtext: isDarkMode ? '#666666' : '#6b7280',
    border: isDarkMode ? '#1a1a1a' : '#e5e7eb',
    inputBg: isDarkMode ? '#000000' : '#ffffff',
  };

  // Load user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;

      try {
        // Load data from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFormData({
            displayName: user.displayName || userData.displayName || '',
            email: user.email || '',
            phone: userData.phone || '',
            company: userData.company || '',
            licenseNumber: userData.licenseNumber || ''
          });
          setLogoPreview(userData.companyLogo || null);
        } else {
          // Fallback to auth data
          setFormData({
            displayName: user.displayName || '',
            email: user.email || '',
            phone: '',
            company: '',
            licenseNumber: ''
          });
        }
        
        setPhotoPreview(user.photoURL || null);
      } catch (err) {
        console.error('Error loading user data:', err);
      }
    };

    if (isOpen) {
      loadUserData();
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle photo selection
  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        setTimeout(() => setError(''), 3000);
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        setTimeout(() => setError(''), 3000);
        return;
      }

      setPhotoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle logo selection
  const handleLogoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        setTimeout(() => setError(''), 3000);
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        setTimeout(() => setError(''), 3000);
        return;
      }

      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Compress image before upload
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new dimensions (max 800x800)
          let width = img.width;
          let height = img.height;
          const maxSize = 800;
          
          if (width > height) {
            if (width > maxSize) {
              height *= maxSize / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width *= maxSize / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/jpeg', 0.85);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  // Upload photo to Firebase Storage
  const uploadPhoto = async () => {
    if (!photoFile || !user) return null;

    try {
      // Compress image
      const compressedBlob = await compressImage(photoFile);
      
      // Create storage reference
      const storageRef = ref(storage, `profile-photos/${user.uid}`);
      
      // Upload file
      await uploadBytes(storageRef, compressedBlob);
      
      // Get download URL
      const photoURL = await getDownloadURL(storageRef);
      return photoURL;
    } catch (err) {
      console.error('Error uploading photo:', err);
      throw new Error('Failed to upload photo');
    }
  };

  // Upload logo to Firebase Storage
  const uploadLogo = async () => {
    if (!logoFile || !user) return null;

    try {
      // Compress image
      const compressedBlob = await compressImage(logoFile);
      
      // Create storage reference
      const storageRef = ref(storage, `company-logos/${user.uid}`);
      
      // Upload file
      await uploadBytes(storageRef, compressedBlob);
      
      // Get download URL
      const logoURL = await getDownloadURL(storageRef);
      return logoURL;
    } catch (err) {
      console.error('Error uploading logo:', err);
      throw new Error('Failed to upload logo');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updates = {};
      
      // Upload photo if selected
      if (photoFile) {
        const photoURL = await uploadPhoto();
        updates.photoURL = photoURL;
      }

      // Upload logo if selected
      let logoURL = null;
      if (logoFile) {
        logoURL = await uploadLogo();
      }

      // Update display name
      if (formData.displayName !== user.displayName) {
        updates.displayName = formData.displayName;
      }

      // Update Firebase Auth profile
      if (updates.displayName || updates.photoURL) {
        await updateProfile(user, updates);
      }

      // Update Firestore user document with additional fields
      const userDocRef = doc(db, 'users', user.uid);
      const updateData = {
        displayName: formData.displayName,
        phone: formData.phone,
        company: formData.company,
        licenseNumber: formData.licenseNumber,
        photoURL: updates.photoURL || user.photoURL || '',
        updatedAt: new Date().toISOString()
      };
      
      // Only update companyLogo if a new one was uploaded
      if (logoURL) {
        updateData.companyLogo = logoURL;
      }
      
      await updateDoc(userDocRef, updateData);

      // Reload the user's auth data to get updated photoURL
      await user.reload();

      setSuccess('Profile updated successfully!');
      
      // Call onUpdate callback if provided
      if (onUpdate) {
        // Fetch the updated user data from Firestore
        const updatedUserDoc = await getDoc(userDocRef);
        if (updatedUserDoc.exists()) {
          onUpdate(updatedUserDoc.data());
        }
      }
      
      // Close modal after short delay
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  // Main edit profile modal
  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '4rem 1rem',
        overflowY: 'auto'
      }}
    >
      <div style={{
        background: colors.cardBg,
        borderRadius: '0.75rem',
        border: `1px solid ${colors.border}`,
        padding: '2rem 1.5rem',
        maxWidth: '500px',
        width: '100%',
        position: 'relative',
        margin: '0 0 2rem 0'
      }}>
        <button
          onClick={onClose}
          disabled={loading}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'transparent',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            color: colors.subtext,
            padding: '0.25rem',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <X size={24} />
        </button>

        <h2 style={{
          margin: '0 0 1.5rem 0',
          color: colors.text,
          fontSize: '1.5rem',
          fontWeight: '700'
        }}>
          Edit Profile
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Photo Upload Section */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '2rem'
          }}>
            <div style={{
              position: 'relative',
              marginBottom: '1rem'
            }}>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: photoPreview ? 'transparent' : '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                border: `3px solid ${colors.border}`
              }}>
                {photoPreview ? (
                  <img 
                    src={photoPreview} 
                    alt="Profile" 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <User size={60} color="white" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#2563eb',
                  border: `3px solid ${colors.cardBg}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                <Camera size={20} color="white" />
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoSelect}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <p style={{
              margin: 0,
              color: colors.subtext,
              fontSize: '0.8125rem',
              textAlign: 'center'
            }}>
              Click camera icon to upload photo (max 5MB)
            </p>
          </div>

          {/* Form Fields */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: colors.text,
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              Full Name *
            </label>
            <div style={{ position: 'relative' }}>
              <User 
                size={18} 
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: colors.subtext
                }}
              />
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="John Doe"
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '0.5rem',
                  fontSize: '0.9375rem',
                  background: colors.inputBg,
                  color: colors.text,
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: colors.text,
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              Email *
            </label>
            <div style={{ position: 'relative' }}>
              <Mail 
                size={18} 
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: colors.subtext
                }}
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled={true}
                placeholder="john@example.com"
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '0.5rem',
                  fontSize: '0.9375rem',
                  background: isDarkMode ? '#0f0f0f' : '#f3f4f6',
                  color: colors.subtext,
                  boxSizing: 'border-box',
                  cursor: 'not-allowed'
                }}
              />
            </div>
            <p style={{
              margin: '0.5rem 0 0 0',
              color: colors.subtext,
              fontSize: '0.75rem'
            }}>
              Email address cannot be changed
            </p>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: colors.text,
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              Phone Number
            </label>
            <div style={{ position: 'relative' }}>
              <Phone 
                size={18} 
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: colors.subtext
                }}
              />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
                placeholder="(555) 123-4567"
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '0.5rem',
                  fontSize: '0.9375rem',
                  background: colors.inputBg,
                  color: colors.text,
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: colors.text,
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              Company Name
            </label>
            <div style={{ position: 'relative' }}>
              <Briefcase 
                size={18} 
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: colors.subtext
                }}
              />
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                disabled={loading}
                placeholder="Your Electrical Company"
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '0.5rem',
                  fontSize: '0.9375rem',
                  background: colors.inputBg,
                  color: colors.text,
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Company Logo Upload Section */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: colors.text,
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              Company Logo (Optional)
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              border: `1px solid ${colors.border}`,
              borderRadius: '0.5rem',
              background: colors.inputBg
            }}>
              {logoPreview ? (
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '0.5rem',
                  overflow: 'hidden',
                  border: `2px solid ${colors.border}`,
                  flexShrink: 0
                }}>
                  <img 
                    src={logoPreview} 
                    alt="Company Logo" 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      background: 'white'
                    }}
                  />
                </div>
              ) : (
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '0.5rem',
                  background: isDarkMode ? '#1a1a1a' : '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px dashed ${colors.border}`,
                  flexShrink: 0
                }}>
                  <Briefcase size={32} color={colors.subtext} />
                </div>
              )}
              <div style={{ flex: 1 }}>
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={loading}
                  style={{
                    padding: '0.625rem 1rem',
                    background: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    width: '100%'
                  }}
                >
                  {logoPreview ? 'Change Logo' : 'Upload Logo'}
                </button>
                <p style={{
                  margin: '0.5rem 0 0 0',
                  color: colors.subtext,
                  fontSize: '0.75rem'
                }}>
                  PNG, JPG up to 5MB
                </p>
              </div>
            </div>
            <input
              type="file"
              ref={logoInputRef}
              onChange={handleLogoSelect}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: colors.text,
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              Electrician License #
            </label>
            <div style={{ position: 'relative' }}>
              <FileText 
                size={18} 
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: colors.subtext
                }}
              />
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                disabled={loading}
                placeholder="OR-12345 or UT-67890"
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '0.5rem',
                  fontSize: '0.9375rem',
                  background: colors.inputBg,
                  color: colors.text,
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div style={{
              padding: '0.75rem',
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: '0.5rem',
              color: '#dc2626',
              fontSize: '0.875rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {success && (
            <div style={{
              padding: '0.75rem',
              background: '#d1fae5',
              border: '1px solid #6ee7b7',
              borderRadius: '0.5rem',
              color: '#047857',
              fontSize: '0.875rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <CheckCircle size={16} />
              {success}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                flex: 1,
                padding: '0.875rem',
                background: colors.border,
                color: colors.text,
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.displayName}
              style={{
                flex: 1,
                padding: '0.875rem',
                background: (loading || !formData.displayName) ? colors.border : '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: (loading || !formData.displayName) ? 'not-allowed' : 'pointer',
                opacity: (loading || !formData.displayName) ? 0.5 : 1
              }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;