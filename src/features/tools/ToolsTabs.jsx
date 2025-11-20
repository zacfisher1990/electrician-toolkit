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
      color: '#6b7280',
      icon: Table
    },
    'Schematics': { 
      color: '#f59e0b',
      icon: FileCode
    },
    'Code': { 
      color: '#10b981',
      icon: Code
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
    padding: '0.625rem 0.25rem',
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
      {/* Calculators Tab */}
      <button
        onClick={() => setActiveTab('Calculators')}
        style={{
          ...buttonBaseStyle,
          background: activeTab === 'Calculators' 
            ? `${toolConfig.Calculators.color}20` 
            : (colors.text === '#e0e0e0' ? '#374151' : '#f3f4f6'),
          color: activeTab === 'Calculators' 
            ? toolConfig.Calculators.color 
            : colors.text,
          borderRight: `1px solid ${colors.border}`
        }}
      >
        <Calculator size={12} />
        <span style={{ fontSize: '0.65rem' }}>Calculators</span>
      </button>

      {/* Tables Tab */}
      <button
        onClick={() => setActiveTab('Tables')}
        style={{
          ...buttonBaseStyle,
          background: activeTab === 'Tables' 
            ? `${toolConfig.Tables.color}20` 
            : (colors.text === '#e0e0e0' ? '#374151' : '#f3f4f6'),
          color: activeTab === 'Tables' 
            ? toolConfig.Tables.color 
            : colors.text,
          borderRight: `1px solid ${colors.border}`
        }}
      >
        <Table size={12} />
        <span style={{ fontSize: '0.65rem' }}>Tables</span>
      </button>

      {/* Schematics Tab */}
      <button
        onClick={() => setActiveTab('Schematics')}
        style={{
          ...buttonBaseStyle,
          background: activeTab === 'Schematics' 
            ? `${toolConfig.Schematics.color}20` 
            : (colors.text === '#e0e0e0' ? '#374151' : '#f3f4f6'),
          color: activeTab === 'Schematics' 
            ? toolConfig.Schematics.color 
            : colors.text,
          borderRight: `1px solid ${colors.border}`
        }}
      >
        <FileCode size={12} />
        <span style={{ fontSize: '0.65rem' }}>Schematics</span>
      </button>

      {/* Code Tab */}
      <button
        onClick={() => setActiveTab('Code')}
        style={{
          ...buttonBaseStyle,
          background: activeTab === 'Code' 
            ? `${toolConfig.Code.color}20` 
            : (colors.text === '#e0e0e0' ? '#374151' : '#f3f4f6'),
          color: activeTab === 'Code' 
            ? toolConfig.Code.color 
            : colors.text
        }}
      >
        <Code size={12} />
        <span style={{ fontSize: '0.65rem' }}>Code</span>
      </button>
    </div>
  );
};

export default ToolsTabs;