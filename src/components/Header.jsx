import React from 'react';
import { Menu, User } from 'lucide-react';

function Header({ 
  headerInfo, 
  isDarkMode, 
  headerVisible, 
  showMenu, 
  setShowMenu, 
  onNavigate, 
  setIsDarkMode 
}) {
  const HeaderIcon = headerInfo.icon;

  const colors = {
    headerBg: isDarkMode ? '#1a1a1a' : '#ffffff',
    headerText: isDarkMode ? '#ffffff' : '#111827',
    headerBorder: isDarkMode ? '#2a2a2a' : '#e5e7eb',
    menuBg: isDarkMode ? '#1a1a1a' : 'white',
    cardBorder: isDarkMode ? '#2a2a2a' : '#e5e7eb',
    cardText: isDarkMode ? '#ffffff' : '#111827',
  };

  return (
    <>
      {/* Notch Area Cover - Always Visible */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'env(safe-area-inset-top)',
        background: isDarkMode ? '#1a1a1a' : '#2563eb',
        zIndex: 101
      }} />

      {/* Persistent Header - Hides on scroll */}
      <div style={{ 
        background: isDarkMode ? '#1a1a1a' : '#2563eb',
        padding: '0.5rem 1rem',
        borderBottom: `1px solid ${colors.headerBorder}`,
        position: 'fixed',
        top: 'env(safe-area-inset-top)',
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: '48px',
        transform: headerVisible ? 'translateY(0)' : 'translateY(calc(-100% - env(safe-area-inset-top)))',
        transition: 'transform 0.3s ease-in-out',
        paddingLeft: 'max(1rem, env(safe-area-inset-left))',
        paddingRight: 'max(1rem, env(safe-area-inset-right))'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem' 
        }}>
          <HeaderIcon size={20} color="white" strokeWidth={2} />
          <h1 style={{ 
            fontSize: '1rem', 
            fontWeight: '600',
            color: 'white',
            margin: 0,
            letterSpacing: '-0.01em'
          }}>
            {headerInfo.title}
          </h1>
        </div>
        
        {/* Menu Button */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowMenu(!showMenu)}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '40px',
              minHeight: '40px',
              lineHeight: 1
            }}
          >
            <Menu size={24} color="white" style={{ display: 'block', flexShrink: 0 }} />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <>
              {/* Backdrop */}
              <div 
                onClick={() => setShowMenu(false)}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 998
                }}
              />
              
              {/* Menu */}
              <div style={{
                position: 'absolute',
                top: '2.5rem',
                right: 0,
                zIndex: 999,
                background: colors.menuBg,
                border: `1px solid ${colors.cardBorder}`,
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                minWidth: '200px',
                overflow: 'hidden'
              }}>
                <div style={{ padding: '0.5rem 0' }}>
                  {/* Profile Button */}
                  <button
                    onClick={() => {
                      onNavigate('profile');
                      setShowMenu(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: colors.cardText,
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                    onMouseEnter={(e) => e.target.style.background = isDarkMode ? '#374151' : '#f3f4f6'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    <User size={16} />
                    <span>Profile</span>
                  </button>

                  <div style={{
                    height: '1px',
                    background: colors.cardBorder,
                    margin: '0.5rem 0'
                  }} />
                  
                  {/* Dark Mode Toggle */}
                  <button
                    onClick={() => {
                      setIsDarkMode(!isDarkMode);
                      setShowMenu(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      color: colors.cardText,
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                    onMouseEnter={(e) => e.target.style.background = isDarkMode ? '#374151' : '#f3f4f6'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                    <span>{isDarkMode ? '☀️' : '🌙'}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Header;