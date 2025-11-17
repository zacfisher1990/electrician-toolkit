import React from 'react';
import { FileText, Edit, ThumbsUp } from 'lucide-react';

const EstimateStatusTabs = ({ 
  activeStatusTab, 
  setActiveStatusTab, 
  statusCounts, 
  colors 
}) => {
  const statusConfig = {
    'Draft': { 
      color: '#6b7280',
      icon: Edit
    },
    'Pending': { 
      color: '#f59e0b',
      icon: FileText
    },
    'Accepted': { 
      color: '#10b981',
      icon: ThumbsUp
    }
  };

  const buttonBaseStyle = {
    flex: 1,
    border: 'none',
    borderRadius: 0,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    padding: '0.5rem 0.25rem',
    gap: '0.25rem',
    transition: 'all 0.2s'
  };

  return (
    <div style={{
      display: 'flex',
      borderRadius: '0.5rem',
      overflow: 'hidden',
      border: `1px solid ${colors.border}`,
      marginBottom: '1rem'
    }}>
      {/* All Tab */}
      <button
        onClick={() => setActiveStatusTab('all')}
        style={{
          ...buttonBaseStyle,
          background: activeStatusTab === 'all' 
            ? colors.text 
            : (colors.text === '#e0e0e0' ? '#374151' : '#f3f4f6'),
          color: activeStatusTab === 'all' 
            ? (colors.text === '#e0e0e0' ? '#111827' : '#ffffff') 
            : colors.text,
          borderRight: `1px solid ${colors.border}`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <span style={{ fontSize: '0.75rem' }}>All</span>
          <span style={{
            background: activeStatusTab === 'all' 
              ? (colors.text === '#e0e0e0' ? '#111827' : '#ffffff') 
              : colors.cardBg,
            color: activeStatusTab === 'all' ? colors.text : colors.subtext,
            padding: '0.125rem 0.375rem',
            borderRadius: '1rem',
            fontSize: '0.65rem',
            fontWeight: '700',
            minWidth: '1.25rem',
            textAlign: 'center'
          }}>
            {statusCounts.all}
          </span>
        </div>
      </button>

      {/* Draft Tab */}
      <button
        onClick={() => setActiveStatusTab('Draft')}
        style={{
          ...buttonBaseStyle,
          background: activeStatusTab === 'Draft' 
            ? `${statusConfig.Draft.color}20` 
            : (colors.text === '#e0e0e0' ? '#374151' : '#f3f4f6'),
          color: activeStatusTab === 'Draft' 
            ? statusConfig.Draft.color 
            : colors.text,
          borderRight: `1px solid ${colors.border}`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Edit size={12} />
          <span style={{
            background: activeStatusTab === 'Draft' 
              ? statusConfig.Draft.color 
              : colors.cardBg,
            color: activeStatusTab === 'Draft' ? 'white' : colors.subtext,
            padding: '0.125rem 0.3rem',
            borderRadius: '1rem',
            fontSize: '0.6rem',
            fontWeight: '700',
            minWidth: '1.1rem',
            textAlign: 'center'
          }}>
            {statusCounts.Draft}
          </span>
        </div>
        <span style={{ fontSize: '0.625rem' }}>Draft</span>
      </button>

      {/* Pending Tab */}
      <button
        onClick={() => setActiveStatusTab('Pending')}
        style={{
          ...buttonBaseStyle,
          background: activeStatusTab === 'Pending' 
            ? `${statusConfig.Pending.color}20` 
            : (colors.text === '#e0e0e0' ? '#374151' : '#f3f4f6'),
          color: activeStatusTab === 'Pending' 
            ? statusConfig.Pending.color 
            : colors.text,
          borderRight: `1px solid ${colors.border}`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <FileText size={12} />
          <span style={{
            background: activeStatusTab === 'Pending' 
              ? statusConfig.Pending.color 
              : colors.cardBg,
            color: activeStatusTab === 'Pending' ? 'white' : colors.subtext,
            padding: '0.125rem 0.3rem',
            borderRadius: '1rem',
            fontSize: '0.6rem',
            fontWeight: '700',
            minWidth: '1.1rem',
            textAlign: 'center'
          }}>
            {statusCounts.Pending}
          </span>
        </div>
        <span style={{ fontSize: '0.625rem' }}>Pending</span>
      </button>

      {/* Accepted Tab */}
      <button
        onClick={() => setActiveStatusTab('Accepted')}
        style={{
          ...buttonBaseStyle,
          background: activeStatusTab === 'Accepted' 
            ? `${statusConfig.Accepted.color}20` 
            : (colors.text === '#e0e0e0' ? '#374151' : '#f3f4f6'),
          color: activeStatusTab === 'Accepted' 
            ? statusConfig.Accepted.color 
            : colors.text
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <ThumbsUp size={12} />
          <span style={{
            background: activeStatusTab === 'Accepted' 
              ? statusConfig.Accepted.color 
              : colors.cardBg,
            color: activeStatusTab === 'Accepted' ? 'white' : colors.subtext,
            padding: '0.125rem 0.3rem',
            borderRadius: '1rem',
            fontSize: '0.6rem',
            fontWeight: '700',
            minWidth: '1.1rem',
            textAlign: 'center'
          }}>
            {statusCounts.Accepted}
          </span>
        </div>
        <span style={{ fontSize: '0.625rem' }}>Accepted</span>
      </button>
    </div>
  );
};

export default EstimateStatusTabs;