import React from 'react';
import { User, Mail, Briefcase, Settings, Info, FileText, LogOut } from 'lucide-react';

const Profile = ({ isDarkMode }) => {
  const colors = {
    bg: isDarkMode ? '#1f2937' : '#f5f5f5',
    cardBg: isDarkMode ? '#111827' : '#ffffff',
    text: isDarkMode ? '#f9fafb' : '#111827',
    subtext: isDarkMode ? '#9ca3af' : '#6b7280',
    border: isDarkMode ? '#374151' : '#e5e7eb',
  };

  const menuItems = [
    { icon: User, label: 'Account Settings', onClick: () => console.log('Account') },
    { icon: Briefcase, label: 'My Projects', onClick: () => console.log('Projects') },
    { icon: FileText, label: 'Saved Calculations', onClick: () => console.log('Saved') },
    { icon: Settings, label: 'App Settings', onClick: () => console.log('Settings') },
    { icon: Info, label: 'About & Help', onClick: () => console.log('About') },
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: colors.bg,
      paddingBottom: '5rem'
    }}>
      {/* Profile Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
        padding: '2rem 1rem 2.5rem',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'white',
          margin: '0 auto 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <User size={40} color="#2563eb" strokeWidth={2} />
        </div>
        <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: '600' }}>
          John Electrician
        </h2>
        <p style={{ 
          margin: 0, 
          opacity: 0.95, 
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.25rem'
        }}>
          <Mail size={14} />
          john@example.com
        </p>
      </div>

      {/* Menu Items */}
      <div style={{ padding: '1rem', marginTop: '-1rem' }}>
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            style={{
              width: '100%',
              background: colors.cardBg,
              border: `1px solid ${colors.border}`,
              borderRadius: '0.75rem',
              padding: '1rem',
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              cursor: 'pointer',
              textAlign: 'left',
              color: colors.text,
              transition: 'all 0.2s',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '0.5rem',
              background: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <item.icon size={20} color="#2563eb" strokeWidth={2} />
            </div>
            <span style={{ fontSize: '1rem', fontWeight: '500', flex: 1 }}>
              {item.label}
            </span>
            <span style={{ color: colors.subtext, fontSize: '1.25rem' }}>›</span>
          </button>
        ))}

        {/* Logout Button */}
        <button
          onClick={() => console.log('Logout')}
          style={{
            width: '100%',
            background: 'transparent',
            border: `2px solid #ef4444`,
            borderRadius: '0.75rem',
            padding: '1rem',
            marginTop: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            cursor: 'pointer',
            color: '#ef4444',
            fontWeight: '600',
            fontSize: '1rem',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#ef4444';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#ef4444';
          }}
        >
          <LogOut size={20} strokeWidth={2} />
          <span>Logout</span>
        </button>
      </div>

      {/* App Version */}
      <div style={{
        textAlign: 'center',
        padding: '2rem 1rem',
        color: colors.subtext,
        fontSize: '0.75rem'
      }}>
        Electrician Toolkit v1.0.0
      </div>
    </div>
  );
};

export default Profile;