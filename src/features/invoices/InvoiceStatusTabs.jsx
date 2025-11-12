import React from 'react';
import { FileText, DollarSign, CheckCircle } from 'lucide-react';

const InvoiceStatusTabs = ({ 
  statusFilter,  // Fixed: was activeStatusTab
  setStatusFilter,  // Fixed: was setActiveStatusTab
  statusCounts, 
  colors 
}) => {
  // Status configuration matching InvoiceCard
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

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '0.375rem',
      marginBottom: '1rem'
    }}>
      {/* All Tab */}
      <button
        onClick={() => setStatusFilter('all')}
        style={{
          height: '46px',
          padding: '0.5rem 0.25rem',
          borderRadius: '0.5rem',
          border: `1px solid ${statusFilter === 'all' ? colors.text : colors.border}`,
          background: statusFilter === 'all' ? colors.text : 'transparent',
          color: statusFilter === 'all' ? (colors.text === '#e0e0e0' ? '#111827' : '#ffffff') : colors.text,
          fontSize: '0.75rem',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.375rem',
          transition: 'all 0.2s'
        }}
      >
        <span>All</span>
        <span style={{
          background: statusFilter === 'all' ? (colors.text === '#e0e0e0' ? '#111827' : '#ffffff') : colors.cardBg,
          color: statusFilter === 'all' ? colors.text : colors.subtext,
          padding: '0.125rem 0.375rem',
          borderRadius: '1rem',
          fontSize: '0.7rem',
          fontWeight: '700',
          minWidth: '1.25rem',
          textAlign: 'center'
        }}>
          {statusCounts.all}
        </span>
      </button>

      {/* Draft Tab */}
      <button
        onClick={() => setStatusFilter('Draft')}
        style={{
          height: '46px',
          padding: '0.5rem 0.25rem',
          borderRadius: '0.5rem',
          border: `1px solid ${statusFilter === 'Draft' ? statusConfig.Draft.color : colors.border}`,
          background: statusFilter === 'Draft' ? `${statusConfig.Draft.color}20` : 'transparent',
          color: statusFilter === 'Draft' ? statusConfig.Draft.color : colors.text,
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
          <FileText size={12} />
          <span style={{
            background: statusFilter === 'Draft' ? statusConfig.Draft.color : colors.cardBg,
            color: statusFilter === 'Draft' ? 'white' : colors.subtext,
            padding: '0.125rem 0.3rem',
            borderRadius: '1rem',
            fontSize: '0.65rem',
            fontWeight: '700',
            minWidth: '1.25rem',
            textAlign: 'center'
          }}>
            {statusCounts.Draft}
          </span>
        </div>
        <span style={{ fontSize: '0.65rem' }}>Draft</span>
      </button>

      {/* Pending Tab */}
      <button
        onClick={() => setStatusFilter('Pending')}
        style={{
          height: '46px',
          padding: '0.5rem 0.25rem',
          borderRadius: '0.5rem',
          border: `1px solid ${statusFilter === 'Pending' ? statusConfig.Pending.color : colors.border}`,
          background: statusFilter === 'Pending' ? `${statusConfig.Pending.color}20` : 'transparent',
          color: statusFilter === 'Pending' ? statusConfig.Pending.color : colors.text,
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
          <DollarSign size={12} />
          <span style={{
            background: statusFilter === 'Pending' ? statusConfig.Pending.color : colors.cardBg,
            color: statusFilter === 'Pending' ? 'white' : colors.subtext,
            padding: '0.125rem 0.3rem',
            borderRadius: '1rem',
            fontSize: '0.65rem',
            fontWeight: '700',
            minWidth: '1.25rem',
            textAlign: 'center'
          }}>
            {statusCounts.Pending}
          </span>
        </div>
        <span style={{ fontSize: '0.65rem' }}>Pending</span>
      </button>

      {/* Paid Tab */}
      <button
        onClick={() => setStatusFilter('Paid')}
        style={{
          height: '46px',
          padding: '0.5rem 0.25rem',
          borderRadius: '0.5rem',
          border: `1px solid ${statusFilter === 'Paid' ? statusConfig.Paid.color : colors.border}`,
          background: statusFilter === 'Paid' ? `${statusConfig.Paid.color}20` : 'transparent',
          color: statusFilter === 'Paid' ? statusConfig.Paid.color : colors.text,
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
          <CheckCircle size={12} />
          <span style={{
            background: statusFilter === 'Paid' ? statusConfig.Paid.color : colors.cardBg,
            color: statusFilter === 'Paid' ? 'white' : colors.subtext,
            padding: '0.125rem 0.3rem',
            borderRadius: '1rem',
            fontSize: '0.65rem',
            fontWeight: '700',
            minWidth: '1.25rem',
            textAlign: 'center'
          }}>
            {statusCounts.Paid}
          </span>
        </div>
        <span style={{ fontSize: '0.65rem' }}>Paid</span>
      </button>
    </div>
  );
};

export default InvoiceStatusTabs;