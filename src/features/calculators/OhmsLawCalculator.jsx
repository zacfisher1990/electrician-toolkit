import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { exportToPDF } from '../../utils/pdfExport';
import OhmsLawBasic from './OhmsLawBasic';
import OhmsLawSeries from './OhmsLawSeries';
import OhmsLawParallel from './OhmsLawParallel';

const OhmsLawCalculator = forwardRef(({ isDarkMode = false }, ref) => {
  const [activeTab, setActiveTab] = useState('basic');

  const colors = {
    cardBg: isDarkMode ? '#374151' : '#ffffff',
    cardBorder: isDarkMode ? '#4b5563' : '#e5e7eb',
    cardText: isDarkMode ? '#f9fafb' : '#111827',
    labelText: isDarkMode ? '#d1d5db' : '#374151',
    inputBg: isDarkMode ? '#1f2937' : '#ffffff',
    inputBorder: isDarkMode ? '#4b5563' : '#d1d5db',
    sectionBg: isDarkMode ? '#1f2937' : '#f9fafb',
    subtleText: isDarkMode ? '#9ca3af' : '#6b7280'
  };

  const handleExportPDF = (pdfData) => {
    exportToPDF(pdfData);
  };

  // Expose exportPDF function for parent component
  useImperativeHandle(ref, () => ({
    exportPDF: () => {
      // This will be called from the parent, but actual export is handled by child components
      alert('Please use the Export to PDF button within the calculator');
    }
  }));

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Tab Navigation */}
      <div style={{
        background: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        gap: '0.5rem'
      }}>
        <button
          onClick={() => setActiveTab('basic')}
          style={{
            flex: '1 1 auto',
            minWidth: '80px',
            padding: '0.625rem 1rem',
            background: activeTab === 'basic' ? '#3b82f6' : colors.sectionBg,
            color: activeTab === 'basic' ? 'white' : colors.labelText,
            border: `1px solid ${activeTab === 'basic' ? '#3b82f6' : colors.cardBorder}`,
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
        >
          Basic
        </button>
        <button
          onClick={() => setActiveTab('series')}
          style={{
            flex: '1 1 auto',
            minWidth: '80px',
            padding: '0.625rem 1rem',
            background: activeTab === 'series' ? '#3b82f6' : colors.sectionBg,
            color: activeTab === 'series' ? 'white' : colors.labelText,
            border: `1px solid ${activeTab === 'series' ? '#3b82f6' : colors.cardBorder}`,
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
        >
          Series
        </button>
        <button
          onClick={() => setActiveTab('parallel')}
          style={{
            flex: '1 1 auto',
            minWidth: '80px',
            padding: '0.625rem 1rem',
            background: activeTab === 'parallel' ? '#3b82f6' : colors.sectionBg,
            color: activeTab === 'parallel' ? 'white' : colors.labelText,
            border: `1px solid ${activeTab === 'parallel' ? '#3b82f6' : colors.cardBorder}`,
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
        >
          Parallel
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'basic' && (
        <OhmsLawBasic 
          isDarkMode={isDarkMode} 
          colors={colors} 
          onExport={handleExportPDF}
        />
      )}

      {activeTab === 'series' && (
        <OhmsLawSeries 
          isDarkMode={isDarkMode} 
          colors={colors} 
          onExport={handleExportPDF}
        />
      )}

      {activeTab === 'parallel' && (
        <OhmsLawParallel 
          isDarkMode={isDarkMode} 
          colors={colors} 
          onExport={handleExportPDF}
        />
      )}

      {/* Formula Reference Footer */}
      <div style={{
        background: colors.sectionBg,
        padding: '1rem',
        borderRadius: '8px',
        border: `1px solid ${colors.cardBorder}`,
        fontSize: '0.8125rem',
        color: colors.labelText,
        marginTop: '1rem'
      }}>
        <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: colors.cardText }}>
          Formulas:
        </div>
        <div>E = I × R</div>
        <div>P = E × I</div>
        <div>I = E ÷ R</div>
        <div>P = I² × R</div>
        <div>R = E ÷ I</div>
        <div>P = E² ÷ R</div>
      </div>
    </div>
  );
});

export default OhmsLawCalculator;