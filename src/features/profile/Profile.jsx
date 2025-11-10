import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, LogOut, Settings, Bell, Shield, AlertCircle, CheckCircle, Eye, EyeOff, Phone, Briefcase, FileText, Trash2  } from 'lucide-react';
import { getColors } from '../../theme';
import DeleteAccountModal from './DeleteAccountModal';
import { auth } from "../../firebase/firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { createVerificationToken, sendVerificationEmail, isEmailVerifiedCustom } from '../../utils/emailVerification';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import EditProfile from './EditProfile';

const Profile = ({ isDarkMode }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState(''); // NEW: Name field for signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loadingUserData, setLoadingUserData] = useState(true);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);

  // Get colors from centralized theme
  const colors = getColors(isDarkMode);

  // Password validation
  const passwordRequirements = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);
  const passwordsMatch = password === confirmPassword && confirmPassword !== '';

  // Listen for auth state changes
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
    setUser(currentUser);
    
    if (currentUser) {
      // Check custom verification status
      const verified = await isEmailVerifiedCustom(currentUser.uid);
      setIsEmailVerified(verified);
    } else {
      setIsEmailVerified(false);
    }
    
    setLoading(false);
  });

  return () => unsubscribe();
}, []);

// Load user profile data from Firestore
useEffect(() => {
  const loadUserData = async () => {
    if (!user) {
      setLoadingUserData(false);
      return;
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    } catch (err) {
      console.error('Error loading user data:', err);
    } finally {
      setLoadingUserData(false);
    }
  };

  loadUserData();
}, [user]);

  const handleResendVerification = async () => {
  if (!user) return;
  
  setSendingVerification(true);
  setError('');
  setSuccess('');

  try {
    console.log('🔍 Sending custom verification email to:', user.email);
    
    // Create new verification token
    const token = await createVerificationToken(user.uid, user.email);
    
    // Send verification email via Resend ONLY
    await sendVerificationEmail(user.email, token);
    console.log('✅ Verification email sent via Resend');
    
    setSuccess(`Verification email sent to ${user.email}! Check your inbox.`);
    setTimeout(() => setSuccess(''), 8000);
  } catch (err) {
    console.error('❌ Error sending verification email:', err);
    setError(`Failed to send verification email: ${err.message}`);
    setTimeout(() => setError(''), 5000);
  } finally {
    setSendingVerification(false);
  }
};

  const handleSignup = async (e) => {
  e.preventDefault();
  setError('');
  setSuccess('');
  
  // Validation
  if (!name.trim()) {
    setError('Please enter your name');
    return;
  }
  
  if (!isPasswordValid) {
    setError('Please meet all password requirements');
    return;
  }
  
  if (password !== confirmPassword) {
    setError('Passwords do not match');
    return;
  }
  
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update user profile with name
    await updateProfile(userCredential.user, {
      displayName: name
    });
    
    // Save additional user data to Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      displayName: name,
      email: email,
      createdAt: serverTimestamp(),
      emailVerified: false
    });
    
    // Create verification token
    const token = await createVerificationToken(userCredential.user.uid, email);
    
    // Send verification email via Resend
    await sendVerificationEmail(email, token);
    
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setSuccess('Account created! Please check your email inbox to verify your account.');
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') {
      setError('This email is already registered. Try logging in instead.');
    } else {
      setError(err.message);
    }
  }
};

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail('');
      setPassword('');
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else {
        setError(err.message);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div style={{
        background: colors.mainBg,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: colors.text }}>Loading...</div>
      </div>
    );
  }

  // If user is logged in, show profile
  if (user) {
    return (
      <div style={{ 
        background: colors.mainBg,
        paddingBottom: '5rem'
      }}>
        <div style={{ padding: '1rem' }}>
          {/* Email Verification Banner */}
          {!isEmailVerified && (
            <div style={{
              background: '#fef3c7',
              border: '1px solid #fbbf24',
              borderRadius: '0.75rem',
              padding: '1rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem'
            }}>
              <AlertCircle size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
              <div style={{ flex: 1 }}>
                <p style={{
                  margin: '0 0 0.5rem 0',
                  color: '#92400e',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}>
                  Please verify your email
                </p>
                <p style={{
                  margin: '0 0 0.75rem 0',
                  color: '#92400e',
                  fontSize: '0.8125rem'
                }}>
                  Check your inbox for a verification link to activate your account.
                </p>
                <button
                  onClick={handleResendVerification}
                  disabled={sendingVerification}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.8125rem',
                    fontWeight: '600',
                    cursor: sendingVerification ? 'not-allowed' : 'pointer',
                    opacity: sendingVerification ? 0.5 : 1
                  }}
                >
                  {sendingVerification ? 'Sending...' : 'Resend Verification Email'}
                </button>
              </div>
            </div>
          )}

          {/* Success/Error Messages */}
          {success && (
            <div style={{
              padding: '0.75rem',
              background: '#dcfce7',
              border: '1px solid #86efac',
              borderRadius: '0.5rem',
              color: '#16a34a',
              fontSize: '0.875rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <CheckCircle size={18} />
              {success}
            </div>
          )}

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
              <AlertCircle size={18} />
              {error}
            </div>
          )}

         {/* Profile Header */}
<div style={{
  background: colors.cardBg,
  borderRadius: '0.75rem',
  border: `1px solid ${colors.border}`,
  padding: '2rem 1.5rem',
  marginBottom: '1rem',
  boxShadow: 'none'
}}>
  {/* Photo and Name */}
  <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
    <div style={{
      width: '100px',
      height: '100px',
      borderRadius: '50%',
      background: isEmailVerified ? '#10b981' : '#3b82f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1rem',
      position: 'relative',
      overflow: 'hidden',
      border: `3px solid ${colors.border}`
    }}>
      {user.photoURL ? (
        <img 
          src={user.photoURL} 
          alt="Profile" 
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      ) : (
        <User size={50} color="white" />
      )}
      {isEmailVerified && (
        <div style={{
          position: 'absolute',
          bottom: '0',
          right: '0',
          width: '28px',
          height: '28px',
          background: '#10b981',
          borderRadius: '50%',
          border: `3px solid ${colors.cardBg}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <CheckCircle size={16} color="white" />
        </div>
      )}
    </div>
    
    <h2 style={{
      margin: '0 0 0.25rem 0',
      color: colors.text,
      fontSize: '1.5rem',
      fontWeight: '600'
    }}>
      {userData?.displayName || user.displayName || 'User'}
    </h2>
    
    <p style={{
      margin: '0 0 0.75rem 0',
      color: colors.subtext,
      fontSize: '0.9375rem'
    }}>
      {user.email}
    </p>
    
    <p style={{
      margin: 0,
      color: colors.subtext,
      fontSize: '0.875rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.375rem'
    }}>
      {isEmailVerified ? (
        <>
          <CheckCircle size={16} color="#10b981" />
          <span>Verified Account</span>
        </>
      ) : (
        <>
          <AlertCircle size={16} color="#f59e0b" />
          <span>Unverified Account</span>
        </>
      )}
    </p>
  </div>

  {/* Profile Details */}
  {!loadingUserData && userData && (
    <div style={{
      borderTop: `1px solid ${colors.border}`,
      paddingTop: '1.5rem'
    }}>
      {/* Phone */}
      {userData.phone && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1rem',
          padding: '0.75rem',
          background: isDarkMode ? '#1a1a1a' : '#f9fafb',
          borderRadius: '0.5rem'
        }}>
          <Phone size={18} color={colors.subtext} />
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontSize: '0.75rem', 
              color: colors.subtext,
              marginBottom: '0.125rem'
            }}>
              Phone
            </div>
            <div style={{ 
              fontSize: '0.9375rem', 
              color: colors.text,
              fontWeight: '500'
            }}>
              {userData.phone}
            </div>
          </div>
        </div>
      )}

      {/* Company */}
      {userData.company && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1rem',
          padding: '0.75rem',
          background: isDarkMode ? '#1a1a1a' : '#f9fafb',
          borderRadius: '0.5rem'
        }}>
          {userData.companyLogo ? (
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '0.375rem',
              overflow: 'hidden',
              border: `1px solid ${colors.border}`,
              flexShrink: 0,
              background: 'white'
            }}>
              <img 
                src={userData.companyLogo} 
                alt="Company Logo" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>
          ) : (
            <Briefcase size={18} color={colors.subtext} />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontSize: '0.75rem', 
              color: colors.subtext,
              marginBottom: '0.125rem'
            }}>
              Company
            </div>
            <div style={{ 
              fontSize: '0.9375rem', 
              color: colors.text,
              fontWeight: '500'
            }}>
              {userData.company}
            </div>
          </div>
        </div>
      )}

      {/* License Number */}
      {userData.licenseNumber && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem',
          background: isDarkMode ? '#1a1a1a' : '#f9fafb',
          borderRadius: '0.5rem'
        }}>
          <FileText size={18} color={colors.subtext} />
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontSize: '0.75rem', 
              color: colors.subtext,
              marginBottom: '0.125rem'
            }}>
              Electrician License
            </div>
            <div style={{ 
              fontSize: '0.9375rem', 
              color: colors.text,
              fontWeight: '500'
            }}>
              {userData.licenseNumber}
            </div>
          </div>
        </div>
      )}

      {/* No details yet message */}
      {!userData.phone && !userData.company && !userData.licenseNumber && (
        <div style={{
          textAlign: 'center',
          padding: '1rem',
          color: colors.subtext,
          fontSize: '0.875rem'
        }}>
          <Settings size={24} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
          <p style={{ margin: 0 }}>
            Complete your profile by clicking "Edit Profile" below
          </p>
        </div>
      )}
    </div>
  )}
</div>

          {/* Account Settings */}
          <div style={{
            background: colors.cardBg,
            borderRadius: '0.75rem',
            border: `1px solid ${colors.border}`,
            overflow: 'hidden',
            marginBottom: '1rem',
            boxShadow: 'none'
          }}>
            <h3 style={{
              margin: 0,
              padding: '1rem',
              color: colors.text,
              fontSize: '1rem',
              fontWeight: '600',
              borderBottom: `1px solid ${colors.border}`
            }}>
              Account Settings
            </h3>
            
            <button 
              onClick={() => setShowEditProfile(true)}
              style={{
              width: '100%',
              padding: '1rem',
              background: 'transparent',
              border: 'none',
              borderBottom: `1px solid ${colors.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
              color: colors.text
            }}>
              <Settings size={20} color={colors.subtext} />
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: '0.9375rem', fontWeight: '500' }}>Edit Profile</div>
                <div style={{ fontSize: '0.8125rem', color: colors.subtext }}>Update your information</div>
              </div>
            </button>
            
            <button style={{
              width: '100%',
              padding: '1rem',
              background: 'transparent',
              border: 'none',
              borderBottom: `1px solid ${colors.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
              color: colors.text
            }}>
              <Mail size={20} color={colors.subtext} />
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: '0.9375rem', fontWeight: '500' }}>Email</div>
                <div style={{ fontSize: '0.8125rem', color: colors.subtext }}>{user.email}</div>
              </div>
            </button>

            <button style={{
              width: '100%',
              padding: '1rem',
              background: 'transparent',
              border: 'none',
              borderBottom: `1px solid ${colors.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
              color: colors.text
            }}>
              <Bell size={20} color={colors.subtext} />
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: '0.9375rem', fontWeight: '500' }}>Notifications</div>
                <div style={{ fontSize: '0.8125rem', color: colors.subtext }}>Manage preferences</div>
              </div>
            </button>

            <button style={{
              width: '100%',
              padding: '1rem',
              background: 'transparent',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
              color: colors.text
            }}>
              <Shield size={20} color={colors.subtext} />
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: '0.9375rem', fontWeight: '500' }}>Privacy & Security</div>
                <div style={{ fontSize: '0.8125rem', color: colors.subtext }}>Account protection</div>
              </div>
            </button>
          </div>

          {/* Delete Account Button - Place this after Privacy & Security */}
<button
  onClick={() => setShowDeleteAccount(true)}
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    width: '100%',
    padding: '1rem',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.2s',
    borderTop: `1px solid ${colors.border}`
  }}
  onMouseEnter={(e) => e.currentTarget.style.background = isDarkMode ? '#0f0f0f' : '#f3f4f6'}
  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
>
  <div style={{
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: isDarkMode ? '#1a1a1a' : '#fee2e2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  }}>
    <Trash2 size={18} color="#dc2626" />
  </div>
  <div style={{ flex: 1, textAlign: 'left' }}>
    <div style={{
      fontSize: '0.9375rem',
      fontWeight: '600',
      color: '#dc2626',
      marginBottom: '0.125rem'
    }}>
      Delete Account
    </div>
    <div style={{
      fontSize: '0.8125rem',
      color: colors.subtext
    }}>
      Permanently delete your account
    </div>
  </div>
</button>

{/* Delete Account Modal */}
<DeleteAccountModal
  isOpen={showDeleteAccount}
  onClose={() => setShowDeleteAccount(false)}
  isDarkMode={isDarkMode}
/>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '1rem',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '0.75rem',
              fontSize: '0.9375rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: 'none'
            }}
          >
            <LogOut size={20} />
            Log Out
          </button>
        </div>

        {/* Edit Profile Modal */}
        <EditProfile 
          isOpen={showEditProfile}
          onClose={() => setShowEditProfile(false)}
          isDarkMode={isDarkMode}
        />
      </div>
    );
  }

  // If user is not logged in, show login/signup form
  return (
    <div style={{ 
      background: colors.mainBg,
      minHeight: '100vh',
      paddingBottom: '5rem'
    }}>
      <div style={{ padding: '1rem' }}>
        {/* Auth Card */}
        <div style={{
          background: colors.cardBg,
          borderRadius: '0.75rem',
          border: `1px solid ${colors.border}`,
          padding: '2rem 1rem',
          marginTop: '2rem',
          boxShadow: 'none'
        }}>
          {/* Icon */}
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem'
          }}>
            <User size={40} color="white" />
          </div>

          {/* Title */}
          <h2 style={{
            margin: '0 0 0.5rem 0',
            color: colors.text,
            fontSize: '1.5rem',
            fontWeight: '700',
            textAlign: 'center'
          }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{
            margin: '0 0 2rem 0',
            color: colors.subtext,
            fontSize: '0.875rem',
            textAlign: 'center'
          }}>
            {isLogin ? 'Sign in to your account' : 'Sign up to get started'}
          </p>

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '0.75rem',
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: '0.5rem',
              color: '#dc2626',
              fontSize: '0.875rem',
              marginBottom: '1rem'
            }}>
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div style={{
              padding: '0.75rem',
              background: '#dcfce7',
              border: '1px solid #86efac',
              borderRadius: '0.5rem',
              color: '#16a34a',
              fontSize: '0.875rem',
              marginBottom: '1rem'
            }}>
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={isLogin ? handleLogin : handleSignup}>
            {/* Name Field (Signup Only) */}
            {!isLogin && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: colors.text,
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  Full Name
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
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
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
            )}

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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
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

            <div style={{ marginBottom: isLogin ? '1.5rem' : '1rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: colors.text,
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock 
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
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 2.5rem 0.75rem 2.5rem',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '0.5rem',
                    fontSize: '0.9375rem',
                    background: colors.inputBg,
                    color: colors.text,
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: colors.subtext,
                    padding: '0.25rem',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Signup Only) */}
            {!isLogin && (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: colors.text,
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}>
                    Confirm Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock 
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
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 2.5rem 0.75rem 2.5rem',
                        border: `1px solid ${confirmPassword && !passwordsMatch ? '#ef4444' : colors.border}`,
                        borderRadius: '0.5rem',
                        fontSize: '0.9375rem',
                        background: colors.inputBg,
                        color: colors.text,
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: colors.subtext,
                        padding: '0.25rem',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {confirmPassword && !passwordsMatch && (
                    <p style={{
                      margin: '0.5rem 0 0 0',
                      color: '#ef4444',
                      fontSize: '0.8125rem'
                    }}>
                      Passwords do not match
                    </p>
                  )}
                </div>

                {/* Password Requirements */}
                <div style={{
                  marginBottom: '1.5rem',
                  padding: '0.75rem',
                  background: isDarkMode ? '#1a1a1a' : '#f9fafb',
                  borderRadius: '0.5rem',
                  border: `1px solid ${colors.border}`
                }}>
                  <p style={{
                    margin: '0 0 0.5rem 0',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: colors.text
                  }}>
                    Password must have:
                  </p>
                  {[
                    { key: 'minLength', label: 'At least 8 characters' },
                    { key: 'hasUpperCase', label: 'One uppercase letter' },
                    { key: 'hasLowerCase', label: 'One lowercase letter' },
                    { key: 'hasNumber', label: 'One number' }
                  ].map(({ key, label }) => (
                    <div
                      key={key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.25rem'
                      }}
                    >
                      <CheckCircle
                        size={14}
                        style={{
                          color: passwordRequirements[key] ? '#10b981' : colors.subtext,
                          flexShrink: 0
                        }}
                      />
                      <span
                        style={{
                          fontSize: '0.8125rem',
                          color: passwordRequirements[key] ? colors.text : colors.subtext
                        }}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={!isLogin && (!isPasswordValid || !passwordsMatch)}
              style={{
                width: '100%',
                padding: '0.875rem',
                background: (!isLogin && (!isPasswordValid || !passwordsMatch)) ? colors.border : '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: (!isLogin && (!isPasswordValid || !passwordsMatch)) ? 'not-allowed' : 'pointer',
                marginBottom: '1rem',
                opacity: (!isLogin && (!isPasswordValid || !passwordsMatch)) ? 0.5 : 1
              }}
            >
              {isLogin ? 'Sign In' : 'Sign Up'}
            </button>

            <div style={{
              textAlign: 'center',
              color: colors.subtext,
              fontSize: '0.875rem'
            }}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setSuccess('');
                  setName('');
                  setPassword('');
                  setConfirmPassword('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563eb',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  textDecoration: 'underline'
                }}
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;