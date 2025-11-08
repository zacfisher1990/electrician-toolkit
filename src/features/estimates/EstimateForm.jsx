import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import MaterialAutocomplete from './MaterialAutocomplete';
import { getUserMaterials, saveMaterial, initializeCommonMaterials } from './materialsService';

// Additional Item Input Component
const AdditionalItemInput = ({ onAdd, isDarkMode, colors }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [showInputs, setShowInputs] = useState(false);

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    border: `1px solid ${colors.border}`,
    borderRadius: '0.5rem',
    fontSize: '0.9375rem',
    background: colors.inputBg,
    color: colors.text,
    boxSizing: 'border-box'
  };

  const handleAdd = () => {
    if (description && amount) {
      onAdd(description, amount);
      setDescription('');
      setAmount('');
      setShowInputs(false);
    }
  };

  if (!showInputs) {
    return (
      <button
        type="button"
        onClick={() => setShowInputs(true)}
        style={{
          width: '100%',
          padding: '0.75rem',
          background: 'transparent',
          border: `1px dashed ${colors.border}`,
          borderRadius: '0.5rem',
          color: '#2563eb',
          fontSize: '0.875rem',
          fontWeight: '600',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}
      >
        <Plus size={16} />
        Add Item
      </button>
    );
  }

  return (
    <div style={{
      padding: '0.75rem',
      background: colors.bg,
      border: `1px solid ${colors.border}`,
      borderRadius: '0.5rem'
    }}>
      <input
        type="text"
        placeholder="Description (e.g., Service Call)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{
          ...inputStyle,
          marginBottom: '0.5rem'
        }}
      />
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{
            ...inputStyle,
            flex: 1
          }}
          step="0.01"
          min="0"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={!description || !amount}
          style={{
            padding: '0.75rem 1rem',
            background: (!description || !amount) ? colors.border : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: (!description || !amount) ? 'not-allowed' : 'pointer',
            opacity: (!description || !amount) ? 0.5 : 1
          }}
        >
          Add
        </button>
        <button
          type="button"
          onClick={() => {
            setDescription('');
            setAmount('');
            setShowInputs(false);
          }}
          style={{
            padding: '0.75rem 1rem',
            background: 'transparent',
            color: colors.text,
            border: `1px solid ${colors.border}`,
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

const EstimateForm = ({ 
  isDarkMode, 
  editingEstimate,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: editingEstimate?.name || '',
    laborHours: editingEstimate?.laborHours?.toString() || '',
    laborRate: editingEstimate?.laborRate?.toString() || '',
    materials: editingEstimate?.materials || [],
    additionalItems: editingEstimate?.additionalItems || [],
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

  // Label style (matching JobForm)
  const labelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: colors.text,
    marginBottom: '0.375rem'
  };

  // Input style
  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    border: `1px solid ${colors.border}`,
    borderRadius: '0.5rem',
    fontSize: '0.9375rem',
    background: colors.inputBg,
    color: colors.text,
    boxSizing: 'border-box'
  };

  // Update form when editing estimate changes
  useEffect(() => {
    if (editingEstimate) {
      setFormData({
        name: editingEstimate.name,
        laborHours: editingEstimate.laborHours.toString(),
        laborRate: editingEstimate.laborRate.toString(),
        materials: [...editingEstimate.materials],
        additionalItems: editingEstimate.additionalItems ? [...editingEstimate.additionalItems] : [],
        jobId: editingEstimate.jobId || null
      });
    }
  }, [editingEstimate]);

  useEffect(() => {
    const loadMaterials = async () => {
      try {
        await initializeCommonMaterials();
        const materials = await getUserMaterials();
        console.log('Loaded materials:', materials.length);
        setSavedMaterials(materials);
      } catch (error) {
        console.error('Error loading saved materials:', error);
      }
    };
    
    loadMaterials();
  }, []);

  const calculateTotal = (laborHours, laborRate, materials, additionalItems) => {
    const labor = (parseFloat(laborHours) || 0) * (parseFloat(laborRate) || 0);
    const materialsCost = materials.reduce((sum, m) => {
      const quantity = parseFloat(m.quantity) || 1;
      const cost = parseFloat(m.cost) || 0;
      return sum + (quantity * cost);
    }, 0);
    const additionalCost = additionalItems.reduce((sum, item) => {
      return sum + (parseFloat(item.amount) || 0);
    }, 0);
    return labor + materialsCost + additionalCost;
  };

  const currentTotal = calculateTotal(formData.laborHours, formData.laborRate, formData.materials, formData.additionalItems);

  const addMaterial = async (material) => {
    setFormData(prev => ({
      ...prev,
      materials: [...prev.materials, { ...material }]
    }));
    
    try {
      await saveMaterial(material);
      const materials = await getUserMaterials();
      setSavedMaterials(materials);
    } catch (error) {
      console.error('Error saving material:', error);
    }
  };

  const removeMaterial = (index) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index)
    }));
  };

  const addAdditionalItem = (description, amount) => {
    if (description && amount) {
      setFormData(prev => ({
        ...prev,
        additionalItems: [...prev.additionalItems, { description, amount: parseFloat(amount) }]
      }));
    }
  };

  const removeAdditionalItem = (index) => {
    setFormData(prev => ({
      ...prev,
      additionalItems: prev.additionalItems.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    if (formData.name) {
      const total = calculateTotal(formData.laborHours, formData.laborRate, formData.materials, formData.additionalItems);
      
      const estimateData = {
        name: formData.name,
        laborHours: parseFloat(formData.laborHours) || 0,
        laborRate: parseFloat(formData.laborRate) || 0,
        materials: formData.materials,
        additionalItems: formData.additionalItems,
        total: total,
        jobId: formData.jobId || null
      };

      onSave(estimateData);
    }
  };

  return (
    <>
      {/* Estimate Name */}
      <div style={{ marginBottom: '0.75rem' }}>
        <label style={labelStyle}>
          Estimate Name <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          type="text"
          placeholder="Enter estimate name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          style={inputStyle}
        />
      </div>

      {/* Labor Hours and Rate */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '0.75rem',
        marginBottom: '0.75rem'
      }}>
        <div>
          <label style={labelStyle}>Labor Hours</label>
          <input
            type="number"
            placeholder="0"
            value={formData.laborHours}
            onChange={(e) => setFormData({ ...formData, laborHours: e.target.value })}
            style={inputStyle}
            step="0.5"
            min="0"
          />
        </div>

        <div>
          <label style={labelStyle}>Rate/Hour ($)</label>
          <input
            type="number"
            placeholder="0.00"
            value={formData.laborRate}
            onChange={(e) => setFormData({ ...formData, laborRate: e.target.value })}
            style={inputStyle}
            step="0.01"
            min="0"
          />
        </div>
      </div>

      {/* Materials Section */}
      <div style={{ marginBottom: '0.75rem' }}>
        <label style={labelStyle}>Materials</label>

        {/* Existing Materials */}
        {formData.materials.length > 0 && (
          <div style={{ marginBottom: '0.5rem' }}>
            {formData.materials.map((mat, idx) => {
              const quantity = parseFloat(mat.quantity) || 1;
              const unitCost = parseFloat(mat.cost) || 0;
              const totalCost = quantity * unitCost;
              
              return (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: colors.bg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ color: colors.text, fontSize: '0.875rem' }}>
                    {mat.name} {quantity > 1 ? `x${quantity}` : ''}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ color: colors.text, fontSize: '0.875rem', fontWeight: '600' }}>
                      ${totalCost.toFixed(2)}
                    </span>
                    <button
                      type="button"
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
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add New Material */}
        <MaterialAutocomplete
          savedMaterials={savedMaterials}
          onAdd={addMaterial}
          isDarkMode={isDarkMode}
          colors={colors}
        />
      </div>

      {/* Additional Items Section */}
      <div style={{ marginBottom: '0.75rem' }}>
        <label style={labelStyle}>Additional Items</label>
        <div style={{ 
          fontSize: '0.75rem', 
          color: colors.subtext, 
          marginBottom: '0.5rem',
          marginTop: '-0.25rem'
        }}>
          Service fees, trip charges, permits, etc.
        </div>

        {/* Existing Additional Items */}
        {formData.additionalItems.length > 0 && (
          <div style={{ marginBottom: '0.5rem' }}>
            {formData.additionalItems.map((item, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem',
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                borderRadius: '0.5rem',
                marginBottom: '0.5rem'
              }}>
                <span style={{ color: colors.text, fontSize: '0.875rem' }}>
                  {item.description}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ color: colors.text, fontSize: '0.875rem', fontWeight: '600' }}>
                    ${parseFloat(item.amount).toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAdditionalItem(idx)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    aria-label={`Remove ${item.description}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add New Additional Item */}
        <AdditionalItemInput
          onAdd={addAdditionalItem}
          isDarkMode={isDarkMode}
          colors={colors}
        />
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

      {/* Action Buttons - Matching JobForm exact style */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={handleSave}
          disabled={!formData.name}
          style={{
            flex: 1,
            padding: '0.75rem',
            background: (!formData.name) ? colors.border : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.9375rem',
            fontWeight: '600',
            cursor: (!formData.name) ? 'not-allowed' : 'pointer',
            opacity: (!formData.name) ? 0.5 : 1
          }}
        >
          {editingEstimate ? 'Save Changes' : 'Add Estimate'}
        </button>
        <button
          onClick={onCancel}
          style={{
            flex: 1,
            padding: '0.75rem',
            background: 'transparent',
            color: colors.text,
            border: `1px solid ${colors.border}`,
            borderRadius: '0.5rem',
            fontSize: '0.9375rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>
    </>
  );
};

export default EstimateForm;