import React from 'react';
import { FileText, Send, Mail } from 'lucide-react';

const EstimateStatusTabs = ({ 
  activeStatusTab, 
  setActiveStatusTab, 
  statusCounts, 
  colors 
}) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '0.375rem',
      marginBottom: '1rem'
    }}>
      {/* All Tab */}
      <button
        onClick={() => setActiveStatusTab('all')}
        style={{
          padding: '0.5rem 0.25rem',
          borderRadius: '0.5rem',
          border: `1px solid ${activeStatusTab === 'all' ? colors.text : colors.border}`,
          background: activeStatusTab === 'all' ? colors.text : 'transparent',
          color: activeStatusTab === 'all' ? (colors.text === '#e0e0e0' ? '#111827' : '#ffffff') : colors.text,
          fontSize: '0.75rem',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.125rem',
          transition: 'all 0.2s'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <FileText size={12} />
          <span style={{
            background: activeStatusTab === 'all' ? (colors.text === '#e0e0e0' ? '#111827' : '#ffffff') : colors.cardBg,
            color: activeStatusTab === 'all' ? colors.text : colors.subtext,
            padding: '0.125rem 0.3rem',
            borderRadius: '1rem',
            fontSize: '0.65rem',
            fontWeight: '700',
            minWidth: '1.25rem',
            textAlign: 'center'
          }}>
            {statusCounts.all || 0}
          </span>
        </div>
        <span style={{ fontSize: '0.65rem' }}>All</span>
      </button>

      {/* Unsent Tab */}
      <button
        onClick={() => setActiveStatusTab('unsent')}
        style={{
          padding: '0.5rem 0.25rem',
          borderRadius: '0.5rem',
          border: `1px solid ${activeStatusTab === 'unsent' ? '#6b7280' : colors.border}`,
          background: activeStatusTab === 'unsent' ? '#6b728020' : 'transparent',
          color: activeStatusTab === 'unsent' ? '#6b7280' : colors.text,
          fontSize: '0.7rem',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.125rem',
          transition: 'all 0.2s'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Mail size={12} />
          <span style={{
            background: activeStatusTab === 'unsent' ? '#6b7280' : colors.cardBg,
            color: activeStatusTab === 'unsent' ? 'white' : colors.subtext,
            padding: '0.125rem 0.3rem',
            borderRadius: '1rem',
            fontSize: '0.65rem',
            fontWeight: '700',
            minWidth: '1.25rem',
            textAlign: 'center'
          }}>
            {statusCounts.unsent || 0}
          </span>
        </div>
        <span style={{ fontSize: '0.65rem' }}>Unsent</span>
      </button>

      {/* Sent Tab */}
      <button
        onClick={() => setActiveStatusTab('sent')}
        style={{
          padding: '0.5rem 0.25rem',
          borderRadius: '0.5rem',
          border: `1px solid ${activeStatusTab === 'sent' ? '#3b82f6' : colors.border}`,
          background: activeStatusTab === 'sent' ? '#3b82f620' : 'transparent',
          color: activeStatusTab === 'sent' ? '#3b82f6' : colors.text,
          fontSize: '0.7rem',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.125rem',
          transition: 'all 0.2s'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Send size={12} />
          <span style={{
            background: activeStatusTab === 'sent' ? '#3b82f6' : colors.cardBg,
            color: activeStatusTab === 'sent' ? 'white' : colors.subtext,
            padding: '0.125rem 0.3rem',
            borderRadius: '1rem',
            fontSize: '0.65rem',
            fontWeight: '700',
            minWidth: '1.25rem',
            textAlign: 'center'
          }}>
            {statusCounts.sent || 0}
          </span>
        </div>
        <span style={{ fontSize: '0.65rem' }}>Sent</span>
      </button>
    </div>
  );
};

export default EstimateStatusTabs;