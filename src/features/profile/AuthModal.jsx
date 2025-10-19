import React, { useState } from 'react';
import { User, Mail, Lock, X, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { auth } from "../../firebase/firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { createVerificationToken, sendVerificationEmail, isEmailVerifiedCustom } from '../../utils/emailVerification';

const AuthModal = ({ isOpen, onClose, isDarkMode }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const colors = {
    bg: isDarkMode ? '#000000' : '#f9fafb',
    cardBg: isDarkMode ? '#0a0a0a' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#111827',
    subtext: isDarkMode ? '#666666' : '#6b7280',
    border: isDarkMode ? '#1a1a1a' : '#e5e7eb',
    inputBg: isDarkMode ? '#000000' : '#ffffff',
  };

  if (!isOpen) return null;

  // Password validation
  const passwordRequirements = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);
  const passwordsMatch = password === confirmPassword && confirmPassword !== '';

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('Password reset email sent! Check your inbox.');
      setTimeout(() => {
        setIsForgotPassword(false);
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validation
    if (!isPasswordValid) {
      setError('Please meet all password requirements');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create verification token (custom system)
      const token = await createVerificationToken(userCredential.user.uid, email);
      
      // Send ONLY our custom verification email via Resend (goes to inbox!)
      await sendVerificationEmail(email, token);
      
      console.log('✅ Custom verification email sent via Resend');
      
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      onClose();
      alert('Account created! Please check your email inbox to verify your account.');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Try logging in instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please use a stronger password.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if email is verified using custom system
      const isVerified = await isEmailVerifiedCustom(userCredential.user.uid);
      
      if (!isVerified) {
        setError('Please verify your email before logging in. Check your inbox for the verification link.');
        await auth.signOut();
        setLoading(false);
        return;
      }
      
      setEmail('');
      setPassword('');
      onClose();
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email. Try signing up instead.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    setIsForgotPassword(false);
  };

  // Forgot Password View
  if (isForgotPassword) {
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
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}
      >
        <div style={{
          background: colors.cardBg,
          borderRadius: '0.75rem',
          border: `1px solid ${colors.border}`,
          padding: '2rem 1.5rem',
          maxWidth: '400px',
          width: '100%',
          position: 'relative'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: colors.subtext,
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={24} />
          </button>

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
            <Lock size={40} color="white" />
          </div>

          <h2 style={{
            margin: '0 0 0.5rem 0',
            color: colors.text,
            fontSize: '1.5rem',
            fontWeight: '700',
            textAlign: 'center'
          }}>
            Reset Password
          </h2>
          <p style={{
            margin: '0 0 2rem 0',
            color: colors.subtext,
            fontSize: '0.875rem',
            textAlign: 'center'
          }}>
            Enter your email and we'll send you a reset link
          </p>

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

          <form onSubmit={handleForgotPassword}>
            <div style={{ marginBottom: '1.5rem' }}>
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
                  disabled={loading}
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

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.875rem',
                background: loading ? colors.border : '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: '1rem'
              }}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(false);
                resetForm();
              }}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.875rem',
                background: 'transparent',
                color: colors.text,
                border: `1px solid ${colors.border}`,
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              Back to Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Login/Signup View
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
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem'
      }}
    >
      <div style={{
        background: colors.cardBg,
        borderRadius: '0.75rem',
        border: `1px solid ${colors.border}`,
        padding: '2rem 1.5rem',
        maxWidth: '400px',
        width: '100%',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: colors.subtext,
            padding: '0.25rem',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <X size={24} />
        </button>

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
          {isLogin ? 'Sign in to manage your jobs' : 'Sign up to get started'}
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
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '0.125rem' }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={isLogin ? handleLogin : handleSignup}>
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
                disabled={loading}
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
          <div style={{ marginBottom: isLogin ? '0.5rem' : '1rem' }}>
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
                disabled={loading}
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

          {/* Forgot Password Link (Login Only) */}
          {isLogin && (
            <div style={{ marginBottom: '1.5rem', textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => setIsForgotPassword(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563eb',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                  fontWeight: '500',
                  textDecoration: 'underline'
                }}
              >
                Forgot Password?
              </button>
            </div>
          )}

          {/* Confirm Password Field (Signup Only) */}
          {!isLogin && (
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
                  disabled={loading}
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
          )}

          {/* Password Requirements (Signup Only) */}
          {!isLogin && (
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
                Password Requirements:
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
                  <Check
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
          )}

          <button
            type="submit"
            disabled={loading || (!isLogin && (!isPasswordValid || !passwordsMatch))}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: (loading || (!isLogin && (!isPasswordValid || !passwordsMatch))) ? colors.border : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: (loading || (!isLogin && (!isPasswordValid || !passwordsMatch))) ? 'not-allowed' : 'pointer',
              marginBottom: '1rem',
              opacity: (loading || (!isLogin && (!isPasswordValid || !passwordsMatch))) ? 0.5 : 1
            }}
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
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
                resetForm();
              }}
              disabled={loading}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                cursor: loading ? 'not-allowed' : 'pointer',
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

export default AuthModal;