import React from 'react';
import { User, Mail, Phone, Building2, FileText, Settings, DollarSign, ExternalLink } from 'lucide-react';
import { getColors } from '../../theme';

/**
 * Profile Info Card Component
 * Displays all profile information fields with edit button
 */
const AccountInfoCard = ({ user, userData, isDarkMode, onEditProfile }) => {
  const colors = getColors(isDarkMode);

  const fields = [
    {
      icon: User,
      label: 'Full Name',
      value: userData?.displayName,
      isEmpty: !userData?.displayName
    },
    {
      icon: Mail,
      label: 'Email',
      value: user.email,
      isEmpty: false
    },
    {
      icon: Phone,
      label: 'Phone Number',
      value: userData?.phone,
      isEmpty: !userData?.phone
    },
    {
      icon: Building2,
      label: 'Company Name',
      value: userData?.company,
      isEmpty: !userData?.company
    }
  ];

  const hasPaymentMethods = userData?.paymentMethods && userData.paymentMethods.length > 0;

  return (
    <div style={{
      background: colors.cardBg,
      borderRadius: '1rem',
      padding: '1.5rem',
      marginBottom: '1rem',
      border: `1px solid ${colors.border}`
    }}>
      {/* Section Header */}
      <p style={{
        margin: '0 0 0.75rem 0',
        fontSize: '0.875rem',
        fontWeight: '600',
        color: colors.text
      }}>
        Profile Information
      </p>

      {/* Profile Fields */}
      <div style={{ marginBottom: '1.5rem' }}>
        {fields.map((field, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.875rem',
              background: isDarkMode ? '#1a1a1a' : '#f9fafb',
              borderRadius: '0.5rem',
              marginBottom: '0.75rem',
              border: field.isEmpty ? '1px solid #fbbf24' : 'none'
            }}
          >
            <field.icon size={18} style={{ color: colors.subtext, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{
                margin: '0 0 0.125rem 0',
                fontSize: '0.75rem',
                color: colors.subtext,
                fontWeight: '500'
              }}>
                {field.label}
              </p>
              <p style={{
                margin: 0,
                fontSize: '0.9375rem',
                color: field.value ? colors.text : colors.subtext,
                fontStyle: field.value ? 'normal' : 'italic'
              }}>
                {field.value || 'Not set'}
              </p>
            </div>
          </div>
        ))}

        {/* Company Logo - Special rendering with image */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.875rem',
            background: isDarkMode ? '#1a1a1a' : '#f9fafb',
            borderRadius: '0.5rem',
            marginBottom: hasPaymentMethods ? '0.75rem' : 0
          }}
        >
          <FileText size={18} style={{ color: colors.subtext, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{
              margin: '0 0 0.125rem 0',
              fontSize: '0.75rem',
              color: colors.subtext,
              fontWeight: '500'
            }}>
              Company Logo
            </p>
            {userData?.companyLogo ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginTop: '0.5rem'
              }}>
                <img 
                  src={userData.companyLogo}
                  alt="Company Logo"
                  style={{
                    width: '60px',
                    height: '60px',
                    objectFit: 'contain',
                    borderRadius: '0.5rem',
                    border: `1px solid ${colors.border}`,
                    background: 'white',
                    padding: '0.25rem'
                  }}
                />
                <p style={{
                  margin: 0,
                  fontSize: '0.875rem',
                  color: colors.text
                }}>
                  Logo uploaded
                </p>
              </div>
            ) : (
              <p style={{
                margin: 0,
                fontSize: '0.9375rem',
                color: colors.subtext,
                fontStyle: 'italic'
              }}>
                Not uploaded
              </p>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        {hasPaymentMethods && (
          <div
            style={{
              padding: '0.875rem',
              background: isDarkMode ? '#1a1a1a' : '#f9fafb',
              borderRadius: '0.5rem',
              border: `1px solid #10b981`
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.75rem'
            }}>
              <DollarSign size={18} style={{ color: '#10b981', flexShrink: 0 }} />
              <p style={{
                margin: 0,
                fontSize: '0.75rem',
                color: colors.subtext,
                fontWeight: '500'
              }}>
                Payment Methods
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {userData.paymentMethods.map((method, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.625rem',
                    background: isDarkMode ? '#0a0a0a' : '#ffffff',
                    borderRadius: '0.375rem',
                    border: `1px solid ${colors.border}`
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      margin: '0 0 0.125rem 0',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: colors.text
                    }}>
                      {method.name}
                    </p>
                    <p style={{
                      margin: 0,
                      fontSize: '0.75rem',
                      color: colors.subtext,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {method.url}
                    </p>
                  </div>
                  {method.url.startsWith('http') && (
                    <ExternalLink size={14} style={{ color: colors.subtext, marginLeft: '0.5rem' }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Button */}
      <button
        onClick={onEditProfile}
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}
      >
        <Settings size={20} />
        Edit Profile
      </button>
    </div>
  );
};

export default AccountInfoCard;