import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, LogOut, Settings, Bell, Shield } from 'lucide-react';
import { auth } from "../../firebase/firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  sendEmailVerification 
} from 'firebase/auth';

const Profile = ({ isDarkMode }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const colors = {
    bg: isDarkMode ? '#000000' : '#f9fafb',
    cardBg: isDarkMode ? '#0a0a0a' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#111827',
    subtext: isDarkMode ? '#666666' : '#6b7280',
    border: isDarkMode ? '#1a1a1a' : '#e5e7eb',
    inputBg: isDarkMode ? '#000000' : '#ffffff',
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Send welcome email via Netlify function
      try {
        await fetch('/.netlify/functions/send-welcome-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email })
        });
      } catch (emailError) {
        console.error('Welcome email failed:', emailError);
        // Don't block signup if welcome email fails
      }
      
      alert('Welcome! Please check your email to verify your account.');
      
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err.message);
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
      setError(err.message);
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
        background: colors.bg,
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
        background: colors.bg,
        paddingBottom: '5rem'
      }}>
        <div style={{ padding: '1rem' }}>
          {/* Profile Header */}
          <div style={{
            background: colors.cardBg,
            borderRadius: '0.75rem',
            border: `1px solid ${colors.border}`,
            padding: '2rem 1rem',
            marginBottom: '1rem',
            textAlign: 'center',
            boxShadow: 'none'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}>
              <User size={40} color="white" />
            </div>
            <h2 style={{
              margin: '0 0 0.5rem 0',
              color: colors.text,
              fontSize: '1.25rem',
              fontWeight: '600'
            }}>
              {user.email}
            </h2>
            <p style={{
              margin: 0,
              color: colors.subtext,
              fontSize: '0.875rem'
            }}>
              Electrician Account
            </p>
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
      </div>
    );
  }

  // If user is not logged in, show login/signup form
  return (
    <div style={{ 
      background: colors.bg,
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

          {/* Form */}
          <form onSubmit={isLogin ? handleLogin : handleSignup}>
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

            <div style={{ marginBottom: '1.5rem' }}>
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
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '0.875rem',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                marginBottom: '1rem'
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