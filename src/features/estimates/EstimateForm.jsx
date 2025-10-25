import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, Check } from 'lucide-react';
import MaterialAutocomplete from './MaterialAutocomplete';
import { getUserMaterials, saveMaterial } from './materialsService';

const EstimateForm = ({ 
  isDarkMode, 
  editingEstimate,
  onSave,
  onCancel
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: editingEstimate?.name || '',
    laborHours: editingEstimate?.laborHours?.toString() || '',
    laborRate: editingEstimate?.laborRate?.toString() || '',
    materials: editingEstimate?.materials || [],
    jobId: editingEstimate?.jobId || null
  });
  const [savedMaterials, setSavedMaterials] = useState([]);
  

  const colors = {
    bg: isDarkMode ? '#000000' : '#f9fafb',
    cardBg: isDarkMode ? '#1a1a1a' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#111827',
    subtext: isDarkMode ? '#999999' : '#6b7280',
    border: isDarkMode ? '#2a2a2a' : '#e5e7eb',
    inputBg: isDarkMode ? '#000000' : '#ffffff',
  };

  // Open form if editing
  React.useEffect(() => {
    if (editingEstimate) {
      setFormData({
        name: editingEstimate.name,
        laborHours: editingEstimate.laborHours.toString(),
        laborRate: editingEstimate.laborRate.toString(),
        materials: [...editingEstimate.materials],
        jobId: editingEstimate.jobId || null
      });
      setShowForm(true);
    }
  }, [editingEstimate]);

  // Add this after the other useEffect hooks
    useEffect(() => {
    const loadMaterials = async () => {
        try {
        const materials = await getUserMaterials();
        setSavedMaterials(materials);
        } catch (error) {
        console.error('Error loading saved materials:', error);
        }
    };
    
    loadMaterials();
    }, []);

  const calculateTotal = (laborHours, laborRate, materials) => {
  const labor = (parseFloat(laborHours) || 0) * (parseFloat(laborRate) || 0);
  const materialsCost = materials.reduce((sum, m) => {
    const quantity = parseFloat(m.quantity) || 1;
    const cost = parseFloat(m.cost) || 0;
    return sum + (quantity * cost);
  }, 0);
  return labor + materialsCost;
};

  const currentTotal = calculateTotal(formData.laborHours, formData.laborRate, formData.materials);

  const addMaterial = async (material) => {
  // Add to form
  setFormData(prev => ({
    ...prev,
    materials: [...prev.materials, { ...material }]
  }));
  
  // Save to database for future use
  try {
    await saveMaterial(material);
    // Reload saved materials to get updated list
    const materials = await getUserMaterials();
    setSavedMaterials(materials);
  } catch (error) {
    console.error('Error saving material:', error);
    // Still add to form even if save fails
  }
};

  const removeMaterial = (index) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    if (formData.name) {
      const total = calculateTotal(formData.laborHours, formData.laborRate, formData.materials);
      
      const estimateData = {
        name: formData.name,
        laborHours: parseFloat(formData.laborHours) || 0,
        laborRate: parseFloat(formData.laborRate) || 0,
        materials: formData.materials,
        total: total,
        jobId: formData.jobId || null
      };

      onSave(estimateData);
      handleReset();
    }
  };

  const handleReset = () => {
    setFormData({ name: '', laborHours: '', laborRate: '', materials: [], jobId: null });
    setShowForm(false);
  };

  const handleCancel = () => {
    handleReset();
    if (onCancel) onCancel();
  };

  return (
    <div style={{
      background: colors.cardBg,
      borderRadius: '0.75rem',
      border: `1px solid ${colors.border}`,
      boxShadow: 'none',
      marginBottom: '1rem',
      overflow: 'hidden'
    }}>
      {/* Toggle Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          width: '100%',
          padding: '1rem',
          background: 'transparent',
          border: 'none',
          color: colors.text,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '1rem',
          fontWeight: '600'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={20} />
          {editingEstimate ? 'Edit Estimate' : 'New Estimate'}
        </span>
        <ChevronDown 
          size={20} 
          style={{
            transform: showForm ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        />
      </button>

      {/* Form Content */}
      {showForm && (
        <div style={{ 
          padding: '1rem 0.5rem',
          borderTop: `1px solid ${colors.border}`
        }}>

          {/* Estimate Name */}
          <input
            type="text"
            placeholder="Estimate Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={{
              width: '100%',
              padding: '0.75rem',
              marginBottom: '0.75rem',
              background: colors.inputBg,
              border: `1px solid ${colors.border}`,
              borderRadius: '0.5rem',
              color: colors.text,
              fontSize: '0.9375rem',
              boxSizing: 'border-box'
            }}
          />

          {/* Labor Hours and Rate */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '0.75rem',
            marginBottom: '0.75rem'
          }}>
            <input
              type="number"
              placeholder="Labor Hours"
              value={formData.laborHours}
              onChange={(e) => setFormData({ ...formData, laborHours: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: colors.inputBg,
                border: `1px solid ${colors.border}`,
                borderRadius: '0.5rem',
                color: colors.text,
                fontSize: '0.9375rem',
                boxSizing: 'border-box'
              }}
            />
            <input
              type="number"
              placeholder="Rate/Hour ($)"
              value={formData.laborRate}
              onChange={(e) => setFormData({ ...formData, laborRate: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: colors.inputBg,
                border: `1px solid ${colors.border}`,
                borderRadius: '0.5rem',
                color: colors.text,
                fontSize: '0.9375rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Materials Section */}
          <div style={{
            padding: '0.75rem',
            background: colors.bg,
            borderRadius: '0.5rem',
            marginBottom: '0.75rem'
          }}>
            <p style={{
              margin: '0 0 0.5rem 0',
              color: colors.subtext,
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              Materials
            </p>

            {/* Existing Materials */}
            {formData.materials.map((mat, idx) => {
                const quantity = parseFloat(mat.quantity) || 1;
                const unitCost = parseFloat(mat.cost) || 0;
                const totalCost = quantity * unitCost;
                
                return (
                    <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem',
                    background: colors.cardBg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '0.5rem',
                    marginBottom: '0.5rem'
                    }}>
                    <span style={{ color: colors.text, fontSize: '0.875rem' }}>
                        {mat.name} {quantity > 1 ? `x${quantity}` : ''}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: colors.text, fontSize: '0.875rem', fontWeight: '600' }}>
                        ${totalCost.toFixed(2)}
                        </span>
                        <button
                        onClick={() => removeMaterial(idx)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '0.25rem',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                        aria-label={`Remove ${mat.name}`}
                        >
                        <Trash2 size={14} />
                        </button>
                    </div>
                    </div>
                );
                })}

            {/* Add New Material with Autocomplete */}
            <MaterialAutocomplete
            savedMaterials={savedMaterials}
            onAdd={addMaterial}
            isDarkMode={isDarkMode}
            colors={colors}
            />
          </div>

          {/* Total Display */}
          <div style={{
            padding: '0.75rem 0.25rem',
            background: colors.bg,
            borderRadius: '0.5rem',
            marginBottom: '0.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ color: colors.subtext, fontSize: '0.875rem', fontWeight: '500' }}>
              Total Estimate
            </span>
            <span style={{ color: '#10b981', fontSize: '1.25rem', fontWeight: '700' }}>
              ${currentTotal.toFixed(2)}
            </span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleSave}
              disabled={!formData.name}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: formData.name ? '#10b981' : colors.border,
                border: 'none',
                borderRadius: '0.5rem',
                color: 'white',
                cursor: formData.name ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.9375rem',
                fontWeight: '600'
              }}
            >
              <Check size={18} />
              {editingEstimate ? 'Update' : 'Save'} Estimate
            </button>
            {(editingEstimate || showForm) && (
              <button
                onClick={handleCancel}
                style={{
                  padding: '0.75rem 1rem',
                  background: 'transparent',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '0.5rem',
                  color: colors.text,
                  cursor: 'pointer',
                  fontSize: '0.9375rem',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EstimateForm;