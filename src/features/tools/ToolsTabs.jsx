import React from 'react';
import { Calculator, Table, FileCode, Code } from 'lucide-react';

const ToolsTabs = ({ 
  activeTab, 
  setActiveTab, 
  colors 
}) => {
  // Tool categories configuration
  const toolConfig = {
    'Calculators': { 
      color: '#3b82f6',
      icon: Calculator
    },
    'Tables': { 
      color: '#8b5cf6',
      icon: Table
    },
    'Schematics': { 
      color: '#ec4899',
      icon: FileCode
    },
    'Code': { 
      color: '#10b981',
      icon: Code
    }
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '0.375rem',
      marginBottom: '1rem'
    }}>
      {/* Calculators Tab */}
      <button
        onClick={() => setActiveTab('Calculators')}
        style={{
          height: '46px',
          padding: '0.5rem 0.25rem',
          borderRadius: '0.5rem',
          border: `1px solid ${activeTab === 'Calculators' ? toolConfig.Calculators.color : colors.border}`,
          background: activeTab === 'Calculators' ? `${toolConfig.Calculators.color}20` : 'transparent',
          color: activeTab === 'Calculators' ? toolConfig.Calculators.color : colors.text,
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
        <Calculator size={14} />
        <span style={{ fontSize: '0.65rem' }}>Calculators</span>
      </button>

      {/* Tables Tab */}
      <button
        onClick={() => setActiveTab('Tables')}
        style={{
          height: '46px',
          padding: '0.5rem 0.25rem',
          borderRadius: '0.5rem',
          border: `1px solid ${activeTab === 'Tables' ? toolConfig.Tables.color : colors.border}`,
          background: activeTab === 'Tables' ? `${toolConfig.Tables.color}20` : 'transparent',
          color: activeTab === 'Tables' ? toolConfig.Tables.color : colors.text,
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
        <Table size={14} />
        <span style={{ fontSize: '0.65rem' }}>Tables</span>
      </button>

      {/* Schematics Tab */}
      <button
        onClick={() => setActiveTab('Schematics')}
        style={{
          height: '46px',
          padding: '0.5rem 0.25rem',
          borderRadius: '0.5rem',
          border: `1px solid ${activeTab === 'Schematics' ? toolConfig.Schematics.color : colors.border}`,
          background: activeTab === 'Schematics' ? `${toolConfig.Schematics.color}20` : 'transparent',
          color: activeTab === 'Schematics' ? toolConfig.Schematics.color : colors.text,
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
        <FileCode size={14} />
        <span style={{ fontSize: '0.65rem' }}>Schematics</span>
      </button>

      {/* Code Tab */}
      <button
        onClick={() => setActiveTab('Code')}
        style={{
          height: '46px',
          padding: '0.5rem 0.25rem',
          borderRadius: '0.5rem',
          border: `1px solid ${activeTab === 'Code' ? toolConfig.Code.color : colors.border}`,
          background: activeTab === 'Code' ? `${toolConfig.Code.color}20` : 'transparent',
          color: activeTab === 'Code' ? toolConfig.Code.color : colors.text,
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
        <Code size={14} />
        <span style={{ fontSize: '0.65rem' }}>Code</span>
      </button>
    </div>
  );
};

export default ToolsTabs;