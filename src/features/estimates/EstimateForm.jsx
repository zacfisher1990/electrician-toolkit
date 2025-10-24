import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, Check } from 'lucide-react';

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
  const [newMaterial, setNewMaterial] = useState({ name: '', cost: '' });

  const templates = [
    { 
      name: 'Outlet Installation', 
      laborHours: 2, 
      laborRate: 85, 
      materials: [
        { name: 'GFCI Outlets (6)', cost: 120 }, 
        { name: 'Wire & Boxes', cost: 45 }
      ] 
    },
    { 
      name: 'Panel Upgrade', 
      laborHours: 8, 
      laborRate: 85, 
      materials: [
        { name: '200A Panel', cost: 350 }, 
        { name: 'Wire & Conduit', cost: 180 }
      ] 
    },
    { 
      name: 'Service Call', 
      laborHours: 1, 
      laborRate: 125, 
      materials: [] 
    },
    { 
      name: 'Lighting Install', 
      laborHours: 4, 
      laborRate: 85, 
      materials: [
        { name: 'Fixtures', cost: 200 }, 
        { name: 'Wire & Switches', cost: 60 }
      ] 
    },
    { 
      name: 'Rewiring Room', 
      laborHours: 16, 
      laborRate: 85, 
      materials: [
        { name: 'Wire (500ft)', cost: 180 }, 
        { name: 'Boxes & Devices', cost: 150 }
      ] 
    }
  ];

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

  const calculateTotal = (laborHours, laborRate, materials) => {
    const labor = (parseFloat(laborHours) || 0) * (parseFloat(laborRate) || 0);
    const materialsCost = materials.reduce((sum, m) => sum + (parseFloat(m.cost) || 0), 0);
    return labor + materialsCost;
  };

  const currentTotal = calculateTotal(formData.laborHours, formData.laborRate, formData.materials);

  const applyTemplate = (template) => {
    setFormData({
      ...formData,
      name: template.name,
      laborHours: template.laborHours,
      laborRate: template.laborRate,
      materials: [...template.materials]
    });
  };

  const addMaterial = () => {
    if (newMaterial.name && newMaterial.cost) {
      setFormData(prev => ({
        ...prev,
        materials: [...prev.materials, { ...newMaterial }]
      }));
      setNewMaterial({ name: '', cost: '' });
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
    setNewMaterial({ name: '', cost: '' });
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
          padding: '0 1rem 1rem 1rem',
          borderTop: `1px solid ${colors.border}`
        }}>
          {/* Quick Templates */}
          <div style={{ marginBottom: '1rem', paddingTop: '1rem' }}>
            <p style={{ 
              margin: '0 0 0.5rem 0',
              color: colors.subtext,
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              Quick Start Templates
            </p>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              {templates.map((template, idx) => (
                <button
                  key={idx}
                  onClick={() => applyTemplate(template)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: colors.bg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '0.5rem',
                    color: colors.text,
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}
                >
                  {template.name}
                </button>
              ))}
            </div>
          </div>

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
            {formData.materials.map((mat, idx) => (
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
                  {mat.name}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: colors.text, fontSize: '0.875rem', fontWeight: '600' }}>
                    ${parseFloat(mat.cost).toFixed(2)}
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
            ))}

            {/* Add New Material */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Material name"
                value={newMaterial.name}
                onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && addMaterial()}
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: '0.5rem',
                  background: colors.cardBg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '0.5rem',
                  color: colors.text,
                  fontSize: '0.875rem',
                  boxSizing: 'border-box'
                }}
              />
              <input
                type="number"
                placeholder="Cost"
                value={newMaterial.cost}
                onChange={(e) => setNewMaterial({ ...newMaterial, cost: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && addMaterial()}
                style={{
                  width: '90px',
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
              <button
                onClick={addMaterial}
                style={{
                  width: '40px',
                  flexShrink: 0,
                  padding: '0.5rem',
                  background: '#10b981',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                aria-label="Add material"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Total Display */}
          <div style={{
            padding: '0.75rem',
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