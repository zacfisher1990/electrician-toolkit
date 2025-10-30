// Updated MaterialAutocomplete.jsx with client-side common materials

import React, { useState, useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';
import { COMMON_ELECTRICAL_MATERIALS } from './commonMaterials';

const MaterialAutocomplete = ({ 
  savedMaterials = [], 
  onAdd, 
  isDarkMode,
  colors 
}) => {
  const [newMaterial, setNewMaterial] = useState({ name: '', quantity: '1', cost: '' });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const autocompleteRef = useRef(null);

  // Filter materials based on input - MERGE saved materials with common materials
  useEffect(() => {
    if (newMaterial.name.trim().length > 0) {
      const searchTerm = newMaterial.name.toLowerCase();
      
      // Filter saved materials (these have prices)
      const savedFiltered = savedMaterials.filter(material =>
        material.name.toLowerCase().includes(searchTerm)
      );
      
      // Filter common materials
      const commonFiltered = COMMON_ELECTRICAL_MATERIALS
        .filter(name => name.toLowerCase().includes(searchTerm))
        .map(name => {
          // Check if this common material already exists in saved materials
          const existing = savedMaterials.find(m => m.name === name);
          return existing || { name, cost: 0, isCommon: true };
        })
        .filter(mat => {
          // Remove duplicates (already in savedFiltered)
          return !savedFiltered.some(saved => saved.name === mat.name);
        });
      
      // Combine: saved materials first (they have prices), then common materials
      const combined = [...savedFiltered, ...commonFiltered].slice(0, 10); // Limit to 10 results
      
      setFilteredMaterials(combined);
      setShowSuggestions(combined.length > 0);
    } else {
      setFilteredMaterials([]);
      setShowSuggestions(false);
    }
  }, [newMaterial.name, savedMaterials]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectMaterial = (material) => {
    setNewMaterial({ 
      name: material.name, 
      quantity: '1',
      cost: material.cost > 0 ? material.cost.toString() : ''
    });
    setShowSuggestions(false);
  };

  const handleAdd = () => {
    if (newMaterial.name && newMaterial.quantity && newMaterial.cost) {
      onAdd(newMaterial);
      setNewMaterial({ name: '', quantity: '1', cost: '' });
      setShowSuggestions(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div ref={autocompleteRef} style={{ position: 'relative' }}>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {/* Material Name Input with Autocomplete */}
        <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
          <input
            type="text"
            placeholder="Material name"
            value={newMaterial.name}
            onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
            onKeyPress={handleKeyPress}
            onFocus={() => {
              if (newMaterial.name && filteredMaterials.length > 0) {
                setShowSuggestions(true);
              }
            }}
            style={{
              width: '100%',
              padding: '0.5rem',
              background: colors.cardBg,
              border: `1px solid ${colors.border}`,
              borderRadius: '0.5rem',
              color: colors.text,
              fontSize: '0.875rem',
              boxSizing: 'border-box'
            }}
          />

          {/* Autocomplete Dropdown */}
          {showSuggestions && filteredMaterials.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '0.25rem',
              background: colors.cardBg,
              border: `1px solid ${colors.border}`,
              borderRadius: '0.5rem',
              boxShadow: isDarkMode 
                ? '0 4px 12px rgba(0,0,0,0.6)' 
                : '0 4px 12px rgba(0,0,0,0.15)',
              maxHeight: '200px',
              overflowY: 'auto',
              zIndex: 1000
            }}>
              {filteredMaterials.map((material, idx) => (
                <button
                  key={material.id || material.name || idx}
                  onClick={() => handleSelectMaterial(material)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: idx < filteredMaterials.length - 1 ? `1px solid ${colors.border}` : 'none',
                    color: colors.text,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDarkMode ? '#2a2a2a' : '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span>{material.name}</span>
                  <span style={{ 
                    color: material.cost > 0 ? '#10b981' : colors.subtext, 
                    fontWeight: '600',
                    fontSize: '0.8125rem'
                  }}>
                    {material.cost > 0 ? `$${parseFloat(material.cost).toFixed(2)}` : 'Set price'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cost Input */}
        <input
          type="number"
          placeholder="Cost"
          value={newMaterial.cost}
          onChange={(e) => setNewMaterial({ ...newMaterial, cost: e.target.value })}
          onKeyPress={handleKeyPress}
          step="0.01"
          style={{
            width: '75px',
            flexShrink: 0,
            padding: '0.5rem',
            background: colors.cardBg,
            border: `1px solid ${colors.border}`,
            borderRadius: '0.5rem',
            color: colors.text,
            fontSize: '0.875rem',
            boxSizing: 'border-box'
          }}
        />

        {/* Quantity Input */}
        <input
          type="number"
          placeholder="Qty"
          value={newMaterial.quantity}
          onChange={(e) => setNewMaterial({ ...newMaterial, quantity: e.target.value })}
          onKeyPress={handleKeyPress}
          min="1"
          style={{
            width: '50px',
            flexShrink: 0,
            padding: '0.5rem',
            background: colors.cardBg,
            border: `1px solid ${colors.border}`,
            borderRadius: '0.5rem',
            color: colors.text,
            fontSize: '0.875rem',
            boxSizing: 'border-box'
          }}
        />

        {/* Add Button */}
        <button
          onClick={handleAdd}
          disabled={!newMaterial.name || !newMaterial.quantity || !newMaterial.cost}
          style={{
            width: '40px',
            flexShrink: 0,
            padding: '0.5rem',
            background: (newMaterial.name && newMaterial.quantity && newMaterial.cost) ? '#10b981' : colors.border,
            border: 'none',
            borderRadius: '0.5rem',
            color: 'white',
            cursor: (newMaterial.name && newMaterial.quantity && newMaterial.cost) ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: (newMaterial.name && newMaterial.quantity && newMaterial.cost) ? 1 : 0.5
          }}
          aria-label="Add material"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
};

export default MaterialAutocomplete;