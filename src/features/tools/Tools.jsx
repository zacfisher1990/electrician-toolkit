import React, { useState } from 'react';
import { Search, X, Calculator, Table, FileCode, Code } from 'lucide-react';
import { getColors } from '../../theme';
import CalculatorMenu from './CalculatorMenu';

const Tools = ({ isDarkMode = false }) => {
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
        {/* Tabs - Inlined */}
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
              border: `1px solid ${activeTab === 'Calculators' ? '#3b82f6' : colors.border}`,
              background: activeTab === 'Calculators' ? '#3b82f620' : 'transparent',
              color: activeTab === 'Calculators' ? '#3b82f6' : colors.text,
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
              border: `1px solid ${activeTab === 'Tables' ? '#8b5cf6' : colors.border}`,
              background: activeTab === 'Tables' ? '#8b5cf620' : 'transparent',
              color: activeTab === 'Tables' ? '#8b5cf6' : colors.text,
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
              border: `1px solid ${activeTab === 'Schematics' ? '#ec4899' : colors.border}`,
              background: activeTab === 'Schematics' ? '#ec489920' : 'transparent',
              color: activeTab === 'Schematics' ? '#ec4899' : colors.text,
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
              border: `1px solid ${activeTab === 'Code' ? '#10b981' : colors.border}`,
              background: activeTab === 'Code' ? '#10b98120' : 'transparent',
              color: activeTab === 'Code' ? '#10b981' : colors.text,
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

        {/* Calculators Tab - Shows your existing CalculatorMenu */}
        {activeTab === 'Calculators' && (
          <CalculatorMenu 
            isDarkMode={isDarkMode}
            searchQuery={searchQuery}
          />
        )}

        {/* Tables Tab */}
        {activeTab === 'Tables' && (
          <div style={{
            background: colors.cardBg,
            border: `1px solid ${colors.border}`,
            borderRadius: '0.75rem',
            textAlign: 'center',
            padding: '3rem 1rem',
            color: colors.subtext
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: colors.text }}>Coming Soon</h3>
            <p style={{ margin: 0, fontSize: '0.9375rem' }}>
              NEC reference tables will be available here.
            </p>
          </div>
        )}

        {/* Schematics Tab */}
        {activeTab === 'Schematics' && (
          <div style={{
            background: colors.cardBg,
            border: `1px solid ${colors.border}`,
            borderRadius: '0.75rem',
            textAlign: 'center',
            padding: '3rem 1rem',
            color: colors.subtext
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: colors.text }}>Coming Soon</h3>
            <p style={{ margin: 0, fontSize: '0.9375rem' }}>
              Wiring diagrams will be available here.
            </p>
          </div>
        )}

        {/* Code Tab */}
        {activeTab === 'Code' && (
          <div style={{
            background: colors.cardBg,
            border: `1px solid ${colors.border}`,
            borderRadius: '0.75rem',
            textAlign: 'center',
            padding: '3rem 1rem',
            color: colors.subtext
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: colors.text }}>Coming Soon</h3>
            <p style={{ margin: 0, fontSize: '0.9375rem' }}>
              NEC code references will be available here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tools;