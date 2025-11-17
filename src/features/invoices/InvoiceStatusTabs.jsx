import React from 'react';
import { FileText, DollarSign, CheckCircle } from 'lucide-react';

const InvoiceStatusTabs = ({ 
  statusFilter,
  setStatusFilter,
  statusCounts, 
  colors 
}) => {
  const statusConfig = {
    'Draft': { 
      color: '#6b7280',
      icon: FileText
    },
    'Pending': { 
      color: '#f59e0b',
      icon: DollarSign
    },
    'Paid': { 
      color: '#10b981',
      icon: CheckCircle
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
        onClick={() => setStatusFilter('all')}
        style={{
          ...buttonBaseStyle,
          background: statusFilter === 'all' 
            ? colors.text 
            : (colors.text === '#e0e0e0' ? '#374151' : '#f3f4f6'),
          color: statusFilter === 'all' 
            ? (colors.text === '#e0e0e0' ? '#111827' : '#ffffff') 
            : colors.text,
          borderRight: `1px solid ${colors.border}`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <span style={{ fontSize: '0.75rem' }}>All</span>
          <span style={{
            background: statusFilter === 'all' 
              ? (colors.text === '#e0e0e0' ? '#111827' : '#ffffff') 
              : colors.cardBg,
            color: statusFilter === 'all' ? colors.text : colors.subtext,
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
        onClick={() => setStatusFilter('Draft')}
        style={{
          ...buttonBaseStyle,
          background: statusFilter === 'Draft' 
            ? `${statusConfig.Draft.color}20` 
            : (colors.text === '#e0e0e0' ? '#374151' : '#f3f4f6'),
          color: statusFilter === 'Draft' 
            ? statusConfig.Draft.color 
            : colors.text,
          borderRight: `1px solid ${colors.border}`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <FileText size={12} />
          <span style={{
            background: statusFilter === 'Draft' 
              ? statusConfig.Draft.color 
              : colors.cardBg,
            color: statusFilter === 'Draft' ? 'white' : colors.subtext,
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
        onClick={() => setStatusFilter('Pending')}
        style={{
          ...buttonBaseStyle,
          background: statusFilter === 'Pending' 
            ? `${statusConfig.Pending.color}20` 
            : (colors.text === '#e0e0e0' ? '#374151' : '#f3f4f6'),
          color: statusFilter === 'Pending' 
            ? statusConfig.Pending.color 
            : colors.text,
          borderRight: `1px solid ${colors.border}`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <DollarSign size={12} />
          <span style={{
            background: statusFilter === 'Pending' 
              ? statusConfig.Pending.color 
              : colors.cardBg,
            color: statusFilter === 'Pending' ? 'white' : colors.subtext,
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

      {/* Paid Tab */}
      <button
        onClick={() => setStatusFilter('Paid')}
        style={{
          ...buttonBaseStyle,
          background: statusFilter === 'Paid' 
            ? `${statusConfig.Paid.color}20` 
            : (colors.text === '#e0e0e0' ? '#374151' : '#f3f4f6'),
          color: statusFilter === 'Paid' 
            ? statusConfig.Paid.color 
            : colors.text
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <CheckCircle size={12} />
          <span style={{
            background: statusFilter === 'Paid' 
              ? statusConfig.Paid.color 
              : colors.cardBg,
            color: statusFilter === 'Paid' ? 'white' : colors.subtext,
            padding: '0.125rem 0.3rem',
            borderRadius: '1rem',
            fontSize: '0.6rem',
            fontWeight: '700',
            minWidth: '1.1rem',
            textAlign: 'center'
          }}>
            {statusCounts.Paid}
          </span>
        </div>
        <span style={{ fontSize: '0.625rem' }}>Paid</span>
      </button>
    </div>
  );
};

export default InvoiceStatusTabs;