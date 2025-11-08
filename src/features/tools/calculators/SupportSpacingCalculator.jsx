import React, { useState } from 'react';
import { Ruler, CheckCircle, AlertCircle } from 'lucide-react';
import {
  materialTypes,
  cableTypes,
  conduitTypes,
  conduitSizes,
  getCableSpacing,
  getConduitSpacing,
  generalRequirements,
  necReferences
} from './supportSpacingData';

const SupportSpacingCalculator = ({ isDarkMode = false, onBack }) => {
  const [materialType, setMaterialType] = useState('cable');
  const [cableType, setCableType] = useState('nm-cable');
  const [conduitType, setConduitType] = useState('emt');
  const [conduitSize, setConduitSize] = useState('3/4');
  const [orientation, setOrientation] = useState('horizontal');
  const [runLength, setRunLength] = useState('');

  // Dark mode colors
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

  // Get spacing requirements
  const getSpacingRequirements = () => {
    if (materialType === 'cable') {
      return getCableSpacing(cableType, orientation);
    } else {
      return getConduitSpacing(conduitType, conduitSize, orientation);
    }
  };

  const requirements = getSpacingRequirements();

  // Calculate number of supports needed
  const calculateSupports = () => {
    if (!requirements || !runLength || parseFloat(runLength) <= 0) {
      return null;
    }

    const length = parseFloat(runLength);
    const spacing = requirements.spacing;
    const termination = requirements.termination / 12; // Convert inches to feet

    // First support must be within termination distance
    let remainingLength = length - termination;
    
    if (remainingLength <= 0) {
      // Run is shorter than termination distance - only need supports at ends
      return {
        supportsNeeded: 2,
        totalWithEnds: 2,
        intermediateSupports: 0,
        firstSupport: Math.min(length / 2, termination),
        lastSupport: length - Math.min(length / 2, termination),
        spacing: spacing,
        terminationDistance: requirements.termination
      };
    }

    // Calculate intermediate supports
    const intermediateSupports = Math.ceil(remainingLength / spacing);
    const actualSpacing = remainingLength / intermediateSupports;

    return {
      supportsNeeded: intermediateSupports + 1, // +1 for the first support near termination
      totalWithEnds: intermediateSupports + 2, // +2 including both ends
      intermediateSupports: intermediateSupports,
      firstSupport: termination,
      lastSupport: length - termination,
      spacing: actualSpacing,
      maxSpacing: spacing,
      terminationDistance: requirements.termination
    };
  };

  const supportCalc = calculateSupports();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Material Selection */}
      <div style={{
        background: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ 
          fontSize: '1rem', 
          fontWeight: '600', 
          color: colors.cardText,
          marginTop: 0,
          marginBottom: '1rem',
          borderBottom: `1px solid ${colors.cardBorder}`,
          paddingBottom: '0.5rem'
        }}>
          Material Type
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
          {materialTypes.map(type => (
            <button
              key={type.value}
              onClick={() => setMaterialType(type.value)}
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                border: `2px solid ${materialType === type.value ? '#3b82f6' : colors.cardBorder}`,
                background: materialType === type.value ? '#dbeafe' : colors.inputBg,
                color: materialType === type.value ? '#1e40af' : colors.cardText,
                fontWeight: '600',
                fontSize: '0.9375rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cable/Conduit Selection */}
      <div style={{
        background: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ 
          fontSize: '1rem', 
          fontWeight: '600', 
          color: colors.cardText,
          marginTop: 0,
          marginBottom: '1rem',
          borderBottom: `1px solid ${colors.cardBorder}`,
          paddingBottom: '0.5rem'
        }}>
          {materialType === 'cable' ? 'Cable Type' : 'Conduit Type & Size'}
        </h3>
        
        {materialType === 'cable' ? (
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: colors.labelText,
              marginBottom: '0.5rem' 
            }}>
              Cable Type
            </label>
            <select 
              value={cableType} 
              onChange={(e) => setCableType(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem',
                fontSize: '0.9375rem',
                border: `1px solid ${colors.inputBorder}`,
                borderRadius: '8px',
                backgroundColor: colors.inputBg,
                color: colors.cardText,
                boxSizing: 'border-box'
              }}
            >
              {Object.entries(cableTypes).map(([key, cable]) => (
                <option key={key} value={key}>{cable.name}</option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: colors.labelText,
                marginBottom: '0.5rem' 
              }}>
                Conduit Type
              </label>
              <select 
                value={conduitType} 
                onChange={(e) => setConduitType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  fontSize: '0.9375rem',
                  border: `1px solid ${colors.inputBorder}`,
                  borderRadius: '8px',
                  backgroundColor: colors.inputBg,
                  color: colors.cardText,
                  boxSizing: 'border-box'
                }}
              >
                {Object.entries(conduitTypes).map(([key, conduit]) => (
                  <option key={key} value={key}>{conduit.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: colors.labelText,
                marginBottom: '0.5rem' 
              }}>
                Conduit Size
              </label>
              <select 
                value={conduitSize} 
                onChange={(e) => setConduitSize(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  fontSize: '0.9375rem',
                  border: `1px solid ${colors.inputBorder}`,
                  borderRadius: '8px',
                  backgroundColor: colors.inputBg,
                  color: colors.cardText,
                  boxSizing: 'border-box'
                }}
              >
                {conduitSizes.map(size => (
                  <option key={size} value={size}>{size}"</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Orientation Selection */}
      <div style={{
        background: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ 
          fontSize: '1rem', 
          fontWeight: '600', 
          color: colors.cardText,
          marginTop: 0,
          marginBottom: '1rem',
          borderBottom: `1px solid ${colors.cardBorder}`,
          paddingBottom: '0.5rem'
        }}>
          Installation Orientation
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
          <button
            onClick={() => setOrientation('horizontal')}
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              border: `2px solid ${orientation === 'horizontal' ? '#3b82f6' : colors.cardBorder}`,
              background: orientation === 'horizontal' ? '#dbeafe' : colors.inputBg,
              color: orientation === 'horizontal' ? '#1e40af' : colors.cardText,
              fontWeight: '600',
              fontSize: '0.9375rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Horizontal
          </button>
          <button
            onClick={() => setOrientation('vertical')}
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              border: `2px solid ${orientation === 'vertical' ? '#3b82f6' : colors.cardBorder}`,
              background: orientation === 'vertical' ? '#dbeafe' : colors.inputBg,
              color: orientation === 'vertical' ? '#1e40af' : colors.cardText,
              fontWeight: '600',
              fontSize: '0.9375rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Vertical
          </button>
        </div>
      </div>

      {/* Run Length Input */}
      <div style={{
        background: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ 
          fontSize: '1rem', 
          fontWeight: '600', 
          color: colors.cardText,
          marginTop: 0,
          marginBottom: '1rem',
          borderBottom: `1px solid ${colors.cardBorder}`,
          paddingBottom: '0.5rem'
        }}>
          Run Length (Optional)
        </h3>
        
        <label style={{ 
          display: 'block', 
          fontSize: '0.875rem', 
          fontWeight: '500', 
          color: colors.labelText,
          marginBottom: '0.5rem' 
        }}>
          Total Length (feet)
        </label>
        <input 
          type="number"
          value={runLength}
          onChange={(e) => setRunLength(e.target.value)}
          placeholder="Enter length to calculate number of supports"
          step="0.5"
          min="0"
          style={{
            width: '100%',
            padding: '0.625rem',
            fontSize: '0.9375rem',
            border: `1px solid ${colors.inputBorder}`,
            borderRadius: '8px',
            backgroundColor: colors.inputBg,
            color: colors.cardText,
            boxSizing: 'border-box'
          }}
        />
        <p style={{ 
          fontSize: '0.75rem', 
          color: colors.subtleText, 
          marginTop: '0.25rem',
          margin: '0.25rem 0 0 0'
        }}>
          Enter your run length to calculate the exact number of supports needed
        </p>
      </div>

      {/* Requirements Display */}
      {requirements && (
        <div style={{
          background: colors.cardBg,
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '600', 
            color: colors.cardText,
            marginTop: 0,
            marginBottom: '1rem'
          }}>
            NEC Requirements
          </h3>
          
          <div style={{ 
            background: colors.sectionBg,
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                  Support Spacing
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: '700', color: colors.cardText }}>
                  {requirements.spacing}
                </div>
                <div style={{ fontSize: '0.75rem', color: colors.labelText }}>
                  feet max
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                  From Termination
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: '700', color: colors.cardText }}>
                  {requirements.termination}
                </div>
                <div style={{ fontSize: '0.75rem', color: colors.labelText }}>
                  inches max
                </div>
              </div>
            </div>
            
            <div style={{
              padding: '0.75rem',
              background: '#dbeafe',
              borderRadius: '6px',
              border: '1px solid #93c5fd'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'start', 
                gap: '0.5rem'
              }}>
                <CheckCircle size={18} color="#1e40af" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
                <div>
                  <div style={{ fontSize: '0.8125rem', color: '#1e40af', fontWeight: '600', marginBottom: '0.25rem' }}>
                    NEC {requirements.necRef}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: '#1e3a8a', lineHeight: '1.4' }}>
                    {requirements.notes}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Support Calculation Results */}
          {supportCalc && (
            <div style={{
              background: '#d1fae5',
              border: '1px solid #6ee7b7',
              borderRadius: '8px',
              padding: '1rem'
            }}>
              <div style={{ 
                fontSize: '0.875rem', 
                color: '#047857',
                fontWeight: '600',
                marginBottom: '0.75rem'
              }}>
                Support Layout for {runLength}' Run:
              </div>
              
              <div style={{ 
                display: 'grid', 
                gap: '0.5rem',
                fontSize: '0.8125rem',
                color: '#065f46'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>First support from termination:</span>
                  <span style={{ fontWeight: '600' }}>{supportCalc.firstSupport.toFixed(2)}' ({(supportCalc.firstSupport * 12).toFixed(1)}")</span>
                </div>
                
                {supportCalc.intermediateSupports > 0 && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Intermediate supports needed:</span>
                      <span style={{ fontWeight: '600' }}>{supportCalc.intermediateSupports}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Spacing between supports:</span>
                      <span style={{ fontWeight: '600' }}>{supportCalc.spacing.toFixed(2)}' (max {supportCalc.maxSpacing}')</span>
                    </div>
                  </>
                )}
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  paddingTop: '0.5rem',
                  borderTop: '1px solid #6ee7b7',
                  marginTop: '0.25rem'
                }}>
                  <span style={{ fontWeight: '600' }}>Total supports needed:</span>
                  <span style={{ fontWeight: '700', fontSize: '1rem' }}>{supportCalc.totalWithEnds}</span>
                </div>
                
                <div style={{ 
                  fontSize: '0.75rem',
                  color: '#059669',
                  marginTop: '0.25rem',
                  fontStyle: 'italic'
                }}>
                  (Includes supports at both termination points)
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* General NEC Requirements */}
      <div style={{
        background: colors.sectionBg,
        padding: '1rem',
        borderRadius: '8px',
        border: `1px solid ${colors.cardBorder}`,
        fontSize: '0.8125rem',
        color: colors.labelText
      }}>
        <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: colors.cardText }}>
          {generalRequirements.title}
        </div>
        <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.25rem', lineHeight: '1.6' }}>
          {generalRequirements.rules.map((rule, index) => (
            <li key={index} style={{ marginBottom: '0.25rem' }}>{rule}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SupportSpacingCalculator;