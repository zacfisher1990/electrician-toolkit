import React, { useState } from 'react';
import { User, Mail, Lock, X, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { auth } from "../../firebase/firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification  // ✅ Added for Firebase native verification
} from 'firebase/auth';
// ❌ Removed: import { createVerificationToken, sendVerificationEmail, isEmailVerifiedCustom } from '../../utils/emailVerification';

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

  // ✅ UPDATED: Now uses Firebase's native sendEmailVerification
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
      
      // ✅ Use Firebase's built-in email verification (works on iOS!)
      const actionCodeSettings = {
        url: window.location.origin, // Redirect back to your app after verification
        handleCodeInApp: false,
      };
      
      await sendEmailVerification(userCredential.user, actionCodeSettings);
      
      console.log('✅ Verification email sent via Firebase');
      
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

  // ✅ UPDATED: Now checks Firebase's native emailVerified property
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // ✅ Check Firebase's native emailVerified status (works on iOS!)
      if (!userCredential.user.emailVerified) {
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

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
    >
      <div
        style={{
          background: colors.cardBg,
          borderRadius: '1rem',
          padding: '2rem',
          width: '100%',
          maxWidth: '450px',
          border: `1px solid ${colors.border}`,
          position: 'relative',
        }}
      >
        {/* Close button */}
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
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={24} />
        </button>

        {/* Title */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ margin: '0 0 0.5rem 0', color: colors.text, fontSize: '1.875rem', fontWeight: '700' }}>
            {isForgotPassword ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{ margin: 0, color: colors.subtext, fontSize: '0.875rem' }}>
            {isForgotPassword 
              ? 'Enter your email to receive a password reset link'
              : isLogin 
                ? 'Log in to your account to continue'
                : 'Sign up to start managing your electrical jobs'
            }
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '0.5rem',
            padding: '0.875rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}>
            <AlertCircle size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
            <p style={{ margin: 0, color: '#dc2626', fontSize: '0.875rem', lineHeight: '1.5' }}>{error}</p>
          </div>
        )}

        {success && (
          <div style={{
            background: '#dcfce7',
            border: '1px solid #86efac',
            borderRadius: '0.5rem',
            padding: '0.875rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
          }}>
            <Check size={20} color="#16a34a" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
            <p style={{ margin: 0, color: '#16a34a', fontSize: '0.875rem', lineHeight: '1.5' }}>{success}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={isForgotPassword ? handleForgotPassword : isLogin ? handleLogin : handleSignup}>
          {/* Email field */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text, fontSize: '0.875rem', fontWeight: '500' }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={20} color={colors.subtext} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem 0.875rem 3rem',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '0.5rem',
                  background: colors.inputBg,
                  color: colors.text,
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Password field (not shown in forgot password) */}
          {!isForgotPassword && (
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text, fontSize: '0.875rem', fontWeight: '500' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={20} color={colors.subtext} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.875rem 3rem 0.875rem 3rem',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '0.5rem',
                    background: colors.inputBg,
                    color: colors.text,
                    fontSize: '1rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={20} color={colors.subtext} /> : <Eye size={20} color={colors.subtext} />}
                </button>
              </div>
            </div>
          )}

          {/* Password requirements (shown only during signup) */}
          {!isLogin && !isForgotPassword && password && (
            <div style={{ marginBottom: '1.25rem', padding: '1rem', background: colors.bg, borderRadius: '0.5rem', border: `1px solid ${colors.border}` }}>
              <p style={{ margin: '0 0 0.75rem 0', color: colors.text, fontSize: '0.875rem', fontWeight: '500' }}>Password requirements:</p>
              {Object.entries({
                'At least 8 characters': passwordRequirements.minLength,
                'One uppercase letter': passwordRequirements.hasUpperCase,
                'One lowercase letter': passwordRequirements.hasLowerCase,
                'One number': passwordRequirements.hasNumber,
              }).map(([label, met]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: met ? '#10b981' : colors.border,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {met && <Check size={12} color="white" />}
                  </div>
                  <span style={{ color: met ? '#10b981' : colors.subtext, fontSize: '0.875rem' }}>{label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Confirm password field (shown only during signup) */}
          {!isLogin && !isForgotPassword && (
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: colors.text, fontSize: '0.875rem', fontWeight: '500' }}>
                Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={20} color={colors.subtext} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.875rem 3rem 0.875rem 3rem',
                    border: `1px solid ${confirmPassword && !passwordsMatch ? '#ef4444' : colors.border}`,
                    borderRadius: '0.5rem',
                    background: colors.inputBg,
                    color: colors.text,
                    fontSize: '1rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={20} color={colors.subtext} /> : <Eye size={20} color={colors.subtext} />}
                </button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <p style={{ margin: '0.5rem 0 0 0', color: '#ef4444', fontSize: '0.875rem' }}>Passwords do not match</p>
              )}
              {confirmPassword && passwordsMatch && (
                <p style={{ margin: '0.5rem 0 0 0', color: '#10b981', fontSize: '0.875rem' }}>Passwords match</p>
              )}
            </div>
          )}

          {/* Forgot password link */}
          {isLogin && !isForgotPassword && (
            <div style={{ marginBottom: '1.5rem', textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => setIsForgotPassword(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#3b82f6',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || (!isLogin && !isForgotPassword && (!isPasswordValid || !passwordsMatch))}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: loading || (!isLogin && !isForgotPassword && (!isPasswordValid || !passwordsMatch)) ? colors.border : '#3b82f6',
              color: loading || (!isLogin && !isForgotPassword && (!isPasswordValid || !passwordsMatch)) ? colors.subtext : 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading || (!isLogin && !isForgotPassword && (!isPasswordValid || !passwordsMatch)) ? 'not-allowed' : 'pointer',
              marginBottom: '1rem',
            }}
          >
            {loading ? 'Please wait...' : isForgotPassword ? 'Send Reset Link' : isLogin ? 'Log In' : 'Sign Up'}
          </button>

          {/* Back to login (from forgot password) */}
          {isForgotPassword && (
            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setError('');
                  setSuccess('');
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#3b82f6',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                ← Back to login
              </button>
            </div>
          )}

          {/* Toggle between login and signup */}
          {!isForgotPassword && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, color: colors.subtext, fontSize: '0.875rem' }}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                    setSuccess('');
                    setEmail('');
                    setPassword('');
                    setConfirmPassword('');
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#3b82f6',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    padding: 0,
                    fontWeight: '600',
                  }}
                >
                  {isLogin ? 'Sign up' : 'Log in'}
                </button>
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AuthModal;