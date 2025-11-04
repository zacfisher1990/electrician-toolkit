import React from 'react';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

const StatusTabs = ({ 
  activeStatusTab, 
  setActiveStatusTab, 
  statusCounts, 
  colors 
}) => {
  // Match Tools tab colors exactly
  const statusConfig = {
    'scheduled': { 
      color: '#3b82f6',  // Blue like Tables
      icon: Clock
    },
    'in-progress': { 
      color: '#8b5cf6',  // Purple like... wait
      icon: AlertCircle
    },
    'completed': { 
      color: '#10b981',  // Green like Code
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
      {/* All Tab - Matches Estimates tab exactly */}
      <button
        onClick={() => setActiveStatusTab('all')}
        style={{
          height: '46px',
          padding: '0.5rem 0.25rem',
          borderRadius: '0.5rem',
          border: `1px solid ${activeStatusTab === 'all' ? colors.text : colors.border}`,
          background: activeStatusTab === 'all' ? colors.text : 'transparent',
          color: activeStatusTab === 'all' ? (colors.text === '#e0e0e0' ? '#111827' : '#ffffff') : colors.text,
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
          background: activeStatusTab === 'all' ? (colors.text === '#e0e0e0' ? '#111827' : '#ffffff') : colors.cardBg,
          color: activeStatusTab === 'all' ? colors.text : colors.subtext,
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

      {/* Scheduled Tab - Matches Tables tab (Blue) */}
      <button
        onClick={() => setActiveStatusTab('scheduled')}
        style={{
          height: '46px',
          padding: '0.5rem 0.25rem',
          borderRadius: '0.5rem',
          border: `1px solid ${activeStatusTab === 'scheduled' ? statusConfig.scheduled.color : colors.border}`,
          background: activeStatusTab === 'scheduled' ? `${statusConfig.scheduled.color}20` : 'transparent',
          color: activeStatusTab === 'scheduled' ? statusConfig.scheduled.color : colors.text,
          fontSize: '0.7rem',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.125rem',
          transition: 'all 0.2s'
        }}
      >
        <Clock size={14} />
        <span style={{ fontSize: '0.65rem' }}>Scheduled</span>
      </button>

      {/* In Progress Tab - Matches Schematics tab (Pink) */}
      <button
        onClick={() => setActiveStatusTab('in-progress')}
        style={{
          height: '46px',
          padding: '0.5rem 0.25rem',
          borderRadius: '0.5rem',
          border: `1px solid ${activeStatusTab === 'in-progress' ? '#ec4899' : colors.border}`,
          background: activeStatusTab === 'in-progress' ? '#ec489920' : 'transparent',
          color: activeStatusTab === 'in-progress' ? '#ec4899' : colors.text,
          fontSize: '0.7rem',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.125rem',
          transition: 'all 0.2s'
        }}
      >
        <AlertCircle size={14} />
        <span style={{ fontSize: '0.65rem' }}>In Progress</span>
      </button>

      {/* Completed Tab - Matches Code tab (Green) */}
      <button
        onClick={() => setActiveStatusTab('completed')}
        style={{
          height: '46px',
          padding: '0.5rem 0.25rem',
          borderRadius: '0.5rem',
          border: `1px solid ${activeStatusTab === 'completed' ? statusConfig.completed.color : colors.border}`,
          background: activeStatusTab === 'completed' ? `${statusConfig.completed.color}20` : 'transparent',
          color: activeStatusTab === 'completed' ? statusConfig.completed.color : colors.text,
          fontSize: '0.7rem',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.125rem',
          transition: 'all 0.2s'
        }}
      >
        <CheckCircle size={14} />
        <span style={{ fontSize: '0.65rem' }}>Completed</span>
      </button>
    </div>
  );
};

export default StatusTabs;