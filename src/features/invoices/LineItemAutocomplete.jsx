// LineItemAutocomplete.jsx - Autocomplete for invoice line items

import React, { useState, useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';
import { COMMON_INVOICE_LINE_ITEMS } from './commonLineItems';

const LineItemAutocomplete = ({ 
  savedLineItems = [], 
  onAdd, 
  isDarkMode,
  colors 
}) => {
  const [newLineItem, setNewLineItem] = useState({ description: '', quantity: '1', rate: '' });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredItems, setFilteredItems] = useState([]);
  const autocompleteRef = useRef(null);

  // Filter line items based on input
  useEffect(() => {
    if (newLineItem.description.trim().length > 0) {
      const searchTerm = newLineItem.description.toLowerCase();
      
      // Filter saved line items (these have rates)
      const savedFiltered = savedLineItems.filter(item =>
        item.description.toLowerCase().includes(searchTerm)
      );
      
      // Filter common line items
      const commonFiltered = COMMON_INVOICE_LINE_ITEMS
        .filter(desc => desc.toLowerCase().includes(searchTerm))
        .map(description => {
          // Check if this common item already exists in saved items
          const existing = savedLineItems.find(item => item.description === description);
          return existing || { description, defaultRate: 0, isCommon: true };
        })
        .filter(item => {
          // Remove duplicates (already in savedFiltered)
          return !savedFiltered.some(saved => saved.description === item.description);
        });
      
      // Combine: saved items first (they have rates), then common items
      const combined = [...savedFiltered, ...commonFiltered].slice(0, 10);
      
      setFilteredItems(combined);
      setShowSuggestions(combined.length > 0);
    } else {
      setFilteredItems([]);
      setShowSuggestions(false);
    }
  }, [newLineItem.description, savedLineItems]);

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

  const handleSelectItem = (item) => {
    const rate = item.defaultRate || item.rate || 0;
    setNewLineItem({ 
      description: item.description, 
      quantity: '1',
      rate: rate > 0 ? rate.toString() : ''
    });
    setShowSuggestions(false);
  };

  const handleAdd = () => {
    if (newLineItem.description && newLineItem.quantity && newLineItem.rate) {
      onAdd(newLineItem);
      setNewLineItem({ description: '', quantity: '1', rate: '' });
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
        {/* Description Input with Autocomplete */}
        <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
          <input
            type="text"
            placeholder="Description"
            value={newLineItem.description}
            onChange={(e) => setNewLineItem({ ...newLineItem, description: e.target.value })}
            onKeyPress={handleKeyPress}
            onFocus={() => {
              if (newLineItem.description && filteredItems.length > 0) {
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
          {showSuggestions && filteredItems.length > 0 && (
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
              {filteredItems.map((item, idx) => {
                const rate = item.defaultRate || item.rate || 0;
                return (
                  <button
                    key={item.id || item.description || idx}
                    onClick={() => handleSelectItem(item)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: idx < filteredItems.length - 1 ? `1px solid ${colors.border}` : 'none',
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
                    <span>{item.description}</span>
                    <span style={{ 
                      color: rate > 0 ? '#10b981' : colors.subtext, 
                      fontWeight: '600',
                      fontSize: '0.8125rem'
                    }}>
                      {rate > 0 ? `$${parseFloat(rate).toFixed(2)}` : 'Set rate'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Rate Input */}
        <input
          type="number"
          placeholder="Rate"
          value={newLineItem.rate}
          onChange={(e) => setNewLineItem({ ...newLineItem, rate: e.target.value })}
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
          value={newLineItem.quantity}
          onChange={(e) => setNewLineItem({ ...newLineItem, quantity: e.target.value })}
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
          disabled={!newLineItem.description || !newLineItem.quantity || !newLineItem.rate}
          style={{
            width: '40px',
            flexShrink: 0,
            padding: '0.5rem',
            background: (newLineItem.description && newLineItem.quantity && newLineItem.rate) ? '#10b981' : colors.border,
            border: 'none',
            borderRadius: '0.5rem',
            color: 'white',
            cursor: (newLineItem.description && newLineItem.quantity && newLineItem.rate) ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: (newLineItem.description && newLineItem.quantity && newLineItem.rate) ? 1 : 0.5
          }}
          aria-label="Add line item"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
};

export default LineItemAutocomplete;