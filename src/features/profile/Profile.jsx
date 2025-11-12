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
  updateProfile,
  sendEmailVerification
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import EditProfile from './EditProfile';

const Profile = ({ isDarkMode }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
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

  // ✅ UPDATED: Now uses Firebase's native emailVerified property
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Reload user to get fresh emailVerified status
        await currentUser.reload();
        setIsEmailVerified(currentUser.emailVerified);
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

  // ✅ UPDATED: Now uses Firebase's native sendEmailVerification
  const handleResendVerification = async () => {
    if (!user) return;
    
    setSendingVerification(true);
    setError('');
    setSuccess('');

    try {
      console.log('🔵 Sending Firebase verification email to:', user.email);
      
      const actionCodeSettings = {
        url: window.location.origin,
        handleCodeInApp: false,
      };
      
      await sendEmailVerification(user, actionCodeSettings);
      console.log('✅ Verification email sent via Firebase');
      
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

  // ✅ UPDATED: Now uses Firebase's native sendEmailVerification
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
        createdAt: serverTimestamp()
      });
      
      // Send Firebase verification email
      const actionCodeSettings = {
        url: window.location.origin,
        handleCodeInApp: false,
      };
      
      await sendEmailVerification(userCredential.user, actionCodeSettings);
      
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
              <AlertCircle size={20} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '0.125rem' }} />
              <div style={{ flex: 1 }}>
                <p style={{
                  margin: '0 0 0.5rem 0',
                  color: '#92400e',
                  fontSize: '0.875rem',
                  fontWeight: '600'
                }}>
                  Verify your email address
                </p>
                <p style={{
                  margin: '0 0 0.75rem 0',
                  color: '#92400e',
                  fontSize: '0.8125rem',
                  lineHeight: '1.4'
                }}>
                  Please check your inbox and click the verification link to verify your account.
                </p>
                <button
                  onClick={handleResendVerification}
                  disabled={sendingVerification}
                  style={{
                    background: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    padding: '0.5rem 1rem',
                    fontSize: '0.8125rem',
                    fontWeight: '600',
                    cursor: sendingVerification ? 'not-allowed' : 'pointer',
                    opacity: sendingVerification ? 0.6 : 1
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
              background: '#d1fae5',
              border: '1px solid #10b981',
              borderRadius: '0.75rem',
              padding: '1rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <CheckCircle size={20} style={{ color: '#059669', flexShrink: 0 }} />
              <p style={{
                margin: 0,
                color: '#065f46',
                fontSize: '0.875rem'
              }}>
                {success}
              </p>
            </div>
          )}

          {error && (
            <div style={{
              background: '#fee2e2',
              border: '1px solid #ef4444',
              borderRadius: '0.75rem',
              padding: '1rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <AlertCircle size={20} style={{ color: '#dc2626', flexShrink: 0 }} />
              <p style={{
                margin: 0,
                color: '#991b1b',
                fontSize: '0.875rem'
              }}>
                {error}
              </p>
            </div>
          )}

          {/* Profile Header Card */}
          <div style={{
            background: colors.cardBg,
            borderRadius: '1rem',
            padding: '1.5rem',
            marginBottom: '1rem',
            border: `1px solid ${colors.border}`,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            {/* Profile Photo and Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              {/* Profile Photo */}
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt="Profile"
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    flexShrink: 0,
                    border: `2px solid ${colors.border}`
                  }}
                />
              ) : (
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '2rem',
                  fontWeight: '700',
                  flexShrink: 0
                }}>
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>
              )}
              
              {/* Name and Email */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{
                  margin: '0 0 0.25rem 0',
                  color: colors.text,
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {userData?.displayName || user.displayName || 'User'}
                </h2>
                <p style={{
                  margin: 0,
                  color: colors.subtext,
                  fontSize: '0.875rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {user.email}
                </p>
                {isEmailVerified && (
                  <div style={{
                    background: '#d1fae5',
                    color: '#059669',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    marginTop: '0.5rem'
                  }}>
                    <CheckCircle size={12} />
                    Verified
                  </div>
                )}
              </div>
            </div>

            {/* Additional Profile Details */}
            {!loadingUserData && userData && (
              <div style={{ 
                marginBottom: '1.5rem',
                paddingTop: '1rem',
                borderTop: `1px solid ${colors.border}`
              }}>
                {/* Phone Number */}
                {userData.phone && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '0.75rem'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '0.5rem',
                      background: isDarkMode ? '#1a1a1a' : '#f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Phone size={16} style={{ color: colors.subtext }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        margin: 0,
                        color: colors.subtext,
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        Phone Number
                      </p>
                      <p style={{
                        margin: 0,
                        color: colors.text,
                        fontSize: '0.9375rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {userData.phone}
                      </p>
                    </div>
                  </div>
                )}

                {/* Company Name */}
                {userData.company && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '0.75rem'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '0.5rem',
                      background: isDarkMode ? '#1a1a1a' : '#f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Briefcase size={16} style={{ color: colors.subtext }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        margin: 0,
                        color: colors.subtext,
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        Company Name
                      </p>
                      <p style={{
                        margin: 0,
                        color: colors.text,
                        fontSize: '0.9375rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {userData.company}
                      </p>
                    </div>
                  </div>
                )}

                {/* Company Logo */}
                {userData.companyLogo && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    marginBottom: '0.75rem'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '0.5rem',
                      background: isDarkMode ? '#1a1a1a' : '#f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <FileText size={16} style={{ color: colors.subtext }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        margin: 0,
                        color: colors.subtext,
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        marginBottom: '0.25rem'
                      }}>
                        Company Logo
                      </p>
                      <img 
                        src={userData.companyLogo} 
                        alt="Company Logo"
                        style={{
                          maxWidth: '120px',
                          maxHeight: '60px',
                          objectFit: 'contain',
                          borderRadius: '0.375rem',
                          border: `1px solid ${colors.border}`,
                          background: 'white'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* License Number */}
                {userData.licenseNumber && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '0.5rem',
                      background: isDarkMode ? '#1a1a1a' : '#f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Shield size={16} style={{ color: colors.subtext }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        margin: 0,
                        color: colors.subtext,
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        Electrician License #
                      </p>
                      <p style={{
                        margin: 0,
                        color: colors.text,
                        fontSize: '0.9375rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {userData.licenseNumber}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <button
              onClick={() => {
                if (!isEmailVerified) {
                  setError('Please verify your email address before editing your profile');
                  setTimeout(() => setError(''), 5000);
                  return;
                }
                setShowEditProfile(true);
              }}
              disabled={!isEmailVerified}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: !isEmailVerified ? colors.border : '#2563eb',
                color: !isEmailVerified ? colors.subtext : 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: !isEmailVerified ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                opacity: !isEmailVerified ? 0.5 : 1
              }}
            >
              <Settings size={16} />
              Edit Profile
              {!isEmailVerified && ' (Verify Email First)'}
            </button>
          </div>

          {/* Account Actions */}
          <div style={{
            background: colors.cardBg,
            borderRadius: '1rem',
            border: `1px solid ${colors.border}`,
            overflow: 'hidden',
            marginBottom: '1rem'
          }}>
            <button
              onClick={handleLogout}
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
                color: colors.text,
                fontSize: '0.9375rem'
              }}
            >
              <LogOut size={20} style={{ color: colors.subtext }} />
              <span>Sign Out</span>
            </button>

            <button
              onClick={() => setShowDeleteAccount(true)}
              style={{
                width: '100%',
                padding: '1rem',
                background: 'transparent',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                cursor: 'pointer',
                color: '#dc2626',
                fontSize: '0.9375rem'
              }}
            >
              <Trash2 size={20} />
              <span>Delete Account</span>
            </button>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {showEditProfile && (
          <EditProfile
            isOpen={showEditProfile}
            onClose={() => setShowEditProfile(false)}
            isDarkMode={isDarkMode}
            user={user}
            userData={userData}
            onUpdate={(updatedData) => setUserData(updatedData)}
          />
        )}

        {/* Delete Account Modal */}
        {showDeleteAccount && (
          <DeleteAccountModal
            isOpen={showDeleteAccount}
            onClose={() => setShowDeleteAccount(false)}
            isDarkMode={isDarkMode}
            user={user}
          />
        )}
      </div>
    );
  }

  // If not logged in, show auth form
  return (
    <div style={{
      background: colors.mainBg,
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: colors.cardBg,
        borderRadius: '1rem',
        padding: '2rem',
        border: `1px solid ${colors.border}`,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 1rem',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <User size={32} color="white" />
          </div>
          <h2 style={{
            margin: '0 0 0.5rem 0',
            color: colors.text,
            fontSize: '1.5rem',
            fontWeight: '700'
          }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{
            margin: 0,
            color: colors.subtext,
            fontSize: '0.875rem'
          }}>
            {isLogin ? 'Sign in to continue' : 'Sign up to get started'}
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #ef4444',
            borderRadius: '0.5rem',
            padding: '0.75rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} style={{ color: '#dc2626', flexShrink: 0 }} />
            <p style={{
              margin: 0,
              color: '#991b1b',
              fontSize: '0.8125rem'
            }}>
              {error}
            </p>
          </div>
        )}

        {success && (
          <div style={{
            background: '#d1fae5',
            border: '1px solid #10b981',
            borderRadius: '0.5rem',
            padding: '0.75rem',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle size={16} style={{ color: '#059669', flexShrink: 0 }} />
            <p style={{
              margin: 0,
              color: '#065f46',
              fontSize: '0.8125rem'
            }}>
              {success}
            </p>
          </div>
        )}

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
                Name
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
                  placeholder="Your name"
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

          {/* Email Field */}
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

          {/* Password Field */}
          <div style={{ marginBottom: '1rem' }}>
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
  );
};

export default Profile;