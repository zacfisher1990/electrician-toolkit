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
import PaymentMethodsSection from './PaymentMethodsSection';

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
    licenseNumber: '',
    paymentMethods: []
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
            licenseNumber: userData.licenseNumber || '',
            paymentMethods: userData.paymentMethods || []
          });
          setLogoPreview(userData.companyLogo || null);
        } else {
          // Fallback to auth data
          setFormData({
            displayName: user.displayName || '',
            email: user.email || '',
            phone: '',
            company: '',
            licenseNumber: '',
            paymentMethods: []
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

  // Handle payment methods change
  const handlePaymentMethodsChange = (methods) => {
    setFormData(prev => ({
      ...prev,
      paymentMethods: methods
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
        updates.companyLogo = logoURL;
      }

      // Update Firebase Auth profile
      if (formData.displayName !== user.displayName || updates.photoURL) {
        await updateProfile(user, {
          displayName: formData.displayName,
          ...(updates.photoURL && { photoURL: updates.photoURL })
        });
      }

      // Update Firestore document
      const userDocRef = doc(db, 'users', user.uid);
      const firestoreUpdates = {
        displayName: formData.displayName,
        phone: formData.phone,
        company: formData.company,
        licenseNumber: formData.licenseNumber || '',
        paymentMethods: formData.paymentMethods || [],
        updatedAt: new Date().toISOString()
      };

      if (updates.photoURL) {
        firestoreUpdates.photoURL = updates.photoURL;
      }

      if (logoURL) {
        firestoreUpdates.companyLogo = logoURL;
      }

      await updateDoc(userDocRef, firestoreUpdates);

      // Get updated user data
      const updatedUserDoc = await getDoc(userDocRef);
      const updatedUserData = updatedUserDoc.data();

      setSuccess('Profile updated successfully!');
      
      // Wait a bit to show success message
      setTimeout(() => {
        onUpdate(updatedUserData);
        onClose();
      }, 1000);

    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem',
      paddingBottom: '5rem'
    }}>
      <div style={{
        background: colors.cardBg,
        borderRadius: '1rem',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '85vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          background: colors.cardBg,
          zIndex: 1
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '1.25rem',
            fontWeight: '700',
            color: colors.text
          }}>
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '0.375rem',
              color: colors.subtext,
              opacity: loading ? 0.5 : 1
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {/* Profile Photo */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile"
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: `3px solid ${colors.border}`
                  }}
                />
              ) : (
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  fontWeight: '700',
                  color: 'white'
                }}>
                  {formData.displayName ? formData.displayName.charAt(0).toUpperCase() : 
                   user.email.charAt(0).toUpperCase()}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: '#2563eb',
                  border: `3px solid ${colors.cardBg}`,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Camera size={18} color="white" />
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
              fontSize: '0.875rem',
              textAlign: 'center'
            }}>
              Click camera icon to change photo
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
                disabled={loading}
                required
                placeholder="John Smith"
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
              Email
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
                value={formData.email}
                disabled
                style={{
                  width: '100%',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '0.5rem',
                  fontSize: '0.9375rem',
                  background: colors.border,
                  color: colors.subtext,
                  boxSizing: 'border-box',
                  cursor: 'not-allowed'
                }}
              />
            </div>
            <p style={{
              margin: '0.25rem 0 0 0',
              fontSize: '0.75rem',
              color: colors.subtext
            }}>
              Email cannot be changed
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

          <div style={{ marginBottom: '1rem' }}>
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

          {/* Payment Methods Section */}
          <PaymentMethodsSection
            paymentMethods={formData.paymentMethods}
            onChange={handlePaymentMethodsChange}
            isDarkMode={isDarkMode}
            colors={colors}
          />

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