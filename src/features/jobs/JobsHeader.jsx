import React from 'react';
import { Search, X } from 'lucide-react';

const JobsHeader = ({
  searchQuery,
  setSearchQuery,
  activeStatusTab,
  filteredJobsCount,
  statusConfig,
  colors
}) => {
  const getTabTitle = () => {
    switch (activeStatusTab) {
      case 'all':
        return 'All Jobs';
      case 'scheduled':
        return 'Scheduled Jobs';
      case 'in-progress':
        return 'In Progress Jobs';
      case 'completed':
        return 'Completed Jobs';
      default:
        return 'All Jobs';
    }
  };

  return (
    <>
      {/* Search Bar */}
      <div style={{
        marginBottom: '1rem',
        position: 'relative'
      }}>
        <input
          type="text"
          placeholder="Search jobs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            paddingLeft: '2.5rem',
            paddingRight: searchQuery ? '2.5rem' : '0.75rem',
            border: `1px solid ${colors.border}`,
            borderRadius: '0.5rem',
            fontSize: '0.9375rem',
            background: colors.inputBg,
            color: colors.text,
            boxSizing: 'border-box'
          }}
        />
        <Search 
          size={18} 
          style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: colors.subtext,
            pointerEvents: 'none'
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: colors.subtext,
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Section Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        padding: '0 0.25rem'
      }}>
        <h3 style={{ 
          margin: 0, 
          color: colors.text, 
          fontSize: '1.125rem',
          fontWeight: '600'
        }}>
          {getTabTitle()}
        </h3>
        <span style={{
          fontSize: '0.875rem',
          color: colors.subtext,
          background: colors.cardBg,
          padding: '0.25rem 0.75rem',
          borderRadius: '1rem',
          border: `1px solid ${colors.border}`
        }}>
          {filteredJobsCount} {filteredJobsCount === 1 ? 'job' : 'jobs'}
        </span>
      </div>
    </>
  );
};

export default JobsHeader;