import React from 'react';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

const StatusTabsUnifiedBar = ({ 
  activeStatusTab, 
  setActiveStatusTab, 
  statusCounts, 
  colors 
}) => {
  const statusConfig = {
    'scheduled': { 
      color: '#3b82f6',
      icon: Clock
    },
    'in-progress': { 
      color: '#f59e0b',
      icon: AlertCircle
    },
    'completed': { 
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

      {/* Scheduled Tab */}
      <button
        onClick={() => setActiveStatusTab('scheduled')}
        style={{
          ...buttonBaseStyle,
          background: activeStatusTab === 'scheduled' 
            ? `${statusConfig.scheduled.color}20` 
            : (colors.text === '#e0e0e0' ? '#374151' : '#f3f4f6'),
          color: activeStatusTab === 'scheduled' 
            ? statusConfig.scheduled.color 
            : colors.text,
          borderRight: `1px solid ${colors.border}`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Clock size={12} />
          <span style={{
            background: activeStatusTab === 'scheduled' 
              ? statusConfig.scheduled.color 
              : colors.cardBg,
            color: activeStatusTab === 'scheduled' ? 'white' : colors.subtext,
            padding: '0.125rem 0.3rem',
            borderRadius: '1rem',
            fontSize: '0.6rem',
            fontWeight: '700',
            minWidth: '1.1rem',
            textAlign: 'center'
          }}>
            {statusCounts.scheduled || 0}
          </span>
        </div>
        <span style={{ fontSize: '0.625rem' }}>Scheduled</span>
      </button>

      {/* In Progress Tab */}
      <button
        onClick={() => setActiveStatusTab('in-progress')}
        style={{
          ...buttonBaseStyle,
          background: activeStatusTab === 'in-progress' 
            ? `${statusConfig['in-progress'].color}20` 
            : (colors.text === '#e0e0e0' ? '#374151' : '#f3f4f6'),
          color: activeStatusTab === 'in-progress' 
            ? statusConfig['in-progress'].color 
            : colors.text,
          borderRight: `1px solid ${colors.border}`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <AlertCircle size={12} />
          <span style={{
            background: activeStatusTab === 'in-progress' 
              ? statusConfig['in-progress'].color 
              : colors.cardBg,
            color: activeStatusTab === 'in-progress' ? 'white' : colors.subtext,
            padding: '0.125rem 0.3rem',
            borderRadius: '1rem',
            fontSize: '0.6rem',
            fontWeight: '700',
            minWidth: '1.1rem',
            textAlign: 'center'
          }}>
            {statusCounts['in-progress'] || 0}
          </span>
        </div>
        <span style={{ fontSize: '0.625rem' }}>In Progress</span>
      </button>

      {/* Completed Tab */}
      <button
        onClick={() => setActiveStatusTab('completed')}
        style={{
          ...buttonBaseStyle,
          background: activeStatusTab === 'completed' 
            ? `${statusConfig.completed.color}20` 
            : (colors.text === '#e0e0e0' ? '#374151' : '#f3f4f6'),
          color: activeStatusTab === 'completed' 
            ? statusConfig.completed.color 
            : colors.text
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <CheckCircle size={12} />
          <span style={{
            background: activeStatusTab === 'completed' 
              ? statusConfig.completed.color 
              : colors.cardBg,
            color: activeStatusTab === 'completed' ? 'white' : colors.subtext,
            padding: '0.125rem 0.3rem',
            borderRadius: '1rem',
            fontSize: '0.6rem',
            fontWeight: '700',
            minWidth: '1.1rem',
            textAlign: 'center'
          }}>
            {statusCounts.completed || 0}
          </span>
        </div>
        <span style={{ fontSize: '0.625rem' }}>Completed</span>
      </button>
    </div>
  );
};

export default StatusTabsUnifiedBar;