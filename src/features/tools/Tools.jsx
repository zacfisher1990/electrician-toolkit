import React, { useState } from 'react';
import { Search, X, Calculator, Table, FileCode, Code } from 'lucide-react';
import { getColors } from '../../theme';
import ToolsTabs from './ToolsTabs';
import CalculatorMenu from './calculators/CalculatorMenu';
import TablesContent from './tables/TablesContent';
import SchematicsContent from './schematics/SchematicsContent';
import CodeContent from './code/CodeContent';

const Tools = ({ isDarkMode = false, onNavigate }) => {
  const [activeTab, setActiveTab] = useState('Calculators');
  const [searchQuery, setSearchQuery] = useState('');
  
  const colors = getColors(isDarkMode);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: colors.mainBg,
      paddingBottom: '5rem'
    }}>
      <div style={{ padding: '1rem 0.25rem' }}>
        {/* Tabs Component */}
        <ToolsTabs 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          colors={colors}
        />

        {/* Search Bar */}
        <div style={{ marginBottom: '1rem', position: 'relative' }}>
          <input
            type="text"
            placeholder={`Search ${activeTab.toLowerCase()}...`}
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

        {/* Calculators Tab */}
        {activeTab === 'Calculators' && (
          <CalculatorMenu 
            isDarkMode={isDarkMode}
            searchQuery={searchQuery}
            onSelectCalculator={onNavigate}
          />
        )}

        {/* Tables Tab */}
        {activeTab === 'Tables' && (
          <TablesContent 
            colors={colors}
            isDarkMode={isDarkMode}
          />
        )}

        {/* Schematics Tab */}
        {activeTab === 'Schematics' && (
          <SchematicsContent 
            colors={colors}
            onSelectSchematic={(schematicId) => {
              console.log('Selected schematic:', schematicId);
            }}
          />
        )}

        {/* Code Tab */}
        {activeTab === 'Code' && (
          <CodeContent 
            colors={colors}
            onSelectCode={(codeId) => {
              console.log('Selected code reference:', codeId);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Tools;