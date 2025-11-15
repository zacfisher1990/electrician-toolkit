import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Calculator, GitBranch, GitFork, Info } from 'lucide-react';
import { exportToPDF } from '../../../utils/pdfExport';
import OhmsLawBasic from './OhmsLawBasic';
import OhmsLawSeries from './OhmsLawSeries';
import OhmsLawParallel from './OhmsLawParallel';
import CalculatorLayout, { 
  Section, 
  InfoBox
} from './CalculatorLayout';

const OhmsLawCalculator = forwardRef(({ isDarkMode = false }, ref) => {
  const [activeTab, setActiveTab] = useState('basic');

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

  const tabs = [
    { id: 'basic', label: 'Basic', icon: Calculator },
    { id: 'series', label: 'Series', icon: GitBranch },
    { id: 'parallel', label: 'Parallel', icon: GitFork }
  ];

  return (
    <div style={{ margin: '0 -1rem' }}>
      <CalculatorLayout isDarkMode={isDarkMode}>
        {/* Tab Navigation */}
        <Section isDarkMode={isDarkMode} style={{ padding: '0.75rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.5rem'
          }}>
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '0.75rem 0.5rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    background: isActive ? '#3b82f6' : isDarkMode ? '#1a1a1a' : '#f3f4f6',
                    color: isActive ? '#ffffff' : isDarkMode ? '#e0e0e0' : '#111827',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.25rem',
                    minHeight: '60px'
                  }}
                >
                  <TabIcon size={18} />
                  <span style={{ 
                    fontSize: '0.8125rem',
                    lineHeight: '1.2',
                    textAlign: 'center'
                  }}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </Section>

        {/* Tab Content */}
        {activeTab === 'basic' && (
          <OhmsLawBasic 
            isDarkMode={isDarkMode} 
            onExport={handleExportPDF}
          />
        )}

        {activeTab === 'series' && (
          <OhmsLawSeries 
            isDarkMode={isDarkMode} 
            onExport={handleExportPDF}
          />
        )}

        {activeTab === 'parallel' && (
          <OhmsLawParallel 
            isDarkMode={isDarkMode} 
            onExport={handleExportPDF}
          />
        )}

        {/* Formula Reference Footer */}
        <InfoBox type="info" icon={Info} isDarkMode={isDarkMode} title="Formulas">
          <div style={{ 
            fontSize: '0.8125rem',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.25rem'
          }}>
            <div>E = I × R</div>
            <div>P = E × I</div>
            <div>I = E ÷ R</div>
            <div>P = I² × R</div>
            <div>R = E ÷ I</div>
            <div>P = E² ÷ R</div>
          </div>
        </InfoBox>
      </CalculatorLayout>
    </div>
  );
});

export default OhmsLawCalculator;