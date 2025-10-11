import React, { useState } from 'react';
import { Plus, Trash2, Edit, ChevronDown, DollarSign, Clock, FileText, Check } from 'lucide-react';

const Estimates = ({ isDarkMode, jobs = [], onApplyToJob }) => {
  const [estimates, setEstimates] = useState([]);

  const [showNewEstimate, setShowNewEstimate] = useState(false);
  const [editingEstimate, setEditingEstimate] = useState(null);
  const [showJobDropdown, setShowJobDropdown] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    laborHours: '',
    laborRate: '',
    materials: []
  });

  const [newMaterial, setNewMaterial] = useState({ name: '', cost: '' });

  const templates = [
    { name: 'Outlet Installation', laborHours: 2, laborRate: 85, materials: [{ name: 'GFCI Outlets (6)', cost: 120 }, { name: 'Wire & Boxes', cost: 45 }] },
    { name: 'Panel Upgrade', laborHours: 8, laborRate: 85, materials: [{ name: '200A Panel', cost: 350 }, { name: 'Wire & Conduit', cost: 180 }] },
    { name: 'Service Call', laborHours: 1, laborRate: 125, materials: [] },
    { name: 'Lighting Install', laborHours: 4, laborRate: 85, materials: [{ name: 'Fixtures', cost: 200 }, { name: 'Wire & Switches', cost: 60 }] },
    { name: 'Rewiring Room', laborHours: 16, laborRate: 85, materials: [{ name: 'Wire (500ft)', cost: 180 }, { name: 'Boxes & Devices', cost: 150 }] }
  ];

  const colors = {
    bg: isDarkMode ? '#000000' : '#f9fafb',
    cardBg: isDarkMode ? '#0a0a0a' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#111827',
    subtext: isDarkMode ? '#666666' : '#6b7280',
    border: isDarkMode ? '#1a1a1a' : '#e5e7eb',
    inputBg: isDarkMode ? '#000000' : '#ffffff',
  };

  const calculateTotal = (laborHours, laborRate, materials) => {
    const labor = (parseFloat(laborHours) || 0) * (parseFloat(laborRate) || 0);
    const materialsCost = materials.reduce((sum, m) => sum + (parseFloat(m.cost) || 0), 0);
    return labor + materialsCost;
  };

  const currentTotal = calculateTotal(formData.laborHours, formData.laborRate, formData.materials);

  const applyTemplate = (template) => {
    setFormData({
      name: template.name,
      laborHours: template.laborHours,
      laborRate: template.laborRate,
      materials: [...template.materials]
    });
    setShowNewEstimate(true);
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

  const saveEstimate = () => {
    if (formData.name) {
      const total = calculateTotal(formData.laborHours, formData.laborRate, formData.materials);
      
      if (editingEstimate) {
        setEstimates(estimates.map(est => 
          est.id === editingEstimate.id 
            ? { ...formData, id: est.id, total, createdAt: est.createdAt }
            : est
        ));
      } else {
        setEstimates([...estimates, { 
          ...formData, 
          id: Date.now(), 
          total,
          createdAt: new Date()
        }]);
      }
      
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({ name: '', laborHours: '', laborRate: '', materials: [] });
    setNewMaterial({ name: '', cost: '' });
    setShowNewEstimate(false);
    setEditingEstimate(null);
  };

  const startEdit = (estimate) => {
    setEditingEstimate(estimate);
    setFormData({
      name: estimate.name,
      laborHours: estimate.laborHours,
      laborRate: estimate.laborRate,
      materials: [...estimate.materials]
    });
    setShowNewEstimate(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteEstimate = (id) => {
    if (window.confirm('Delete this estimate?')) {
      setEstimates(estimates.filter(est => est.id !== id));
    }
  };

  const handleApplyToJob = (estimate, jobId) => {
    if (onApplyToJob) {
      onApplyToJob(estimate, jobId);
    }
    setShowJobDropdown(null);
  };

  return (
    <div style={{ 
      background: colors.bg,
      paddingBottom: '5rem'
    }}>
      <div style={{ padding: '1rem' }}>
        {/* New/Edit Estimate Form */}
        <div style={{
          background: colors.cardBg,
          borderRadius: '0.75rem',
          border: `1px solid ${colors.border}`,
          boxShadow: 'none',
          marginBottom: '1rem',
          overflow: 'hidden'
        }}>
          <button
            onClick={() => setShowNewEstimate(!showNewEstimate)}
            style={{
              width: '100%',
              padding: '1rem',
              background: 'transparent',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              color: colors.text
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '1.125rem',
              fontWeight: '600'
            }}>
              <Plus size={20} />
              {editingEstimate ? 'Edit Estimate' : 'New Estimate'}
            </div>
            <ChevronDown 
              size={20} 
              style={{
                transform: showNewEstimate ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }}
            />
          </button>

          {showNewEstimate && (
            <div style={{
              padding: '0 1rem 1rem 1rem',
              borderTop: `1px solid ${colors.border}`
            }}>
              <div style={{ paddingTop: '1rem' }}>
                <input
                  type="text"
                  placeholder="Estimate Name *"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    marginBottom: '0.75rem',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '0.5rem',
                    fontSize: '0.9375rem',
                    background: colors.inputBg,
                    color: colors.text,
                    boxSizing: 'border-box'
                  }}
                />

                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: '600', color: colors.text }}>
                  Labor
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <input
                    type="number"
                    placeholder="Hours"
                    value={formData.laborHours}
                    onChange={(e) => setFormData(prev => ({...prev, laborHours: e.target.value}))}
                    style={{
                      padding: '0.75rem',
                      border: `1px solid ${colors.border}`,
                      borderRadius: '0.5rem',
                      fontSize: '0.9375rem',
                      background: colors.inputBg,
                      color: colors.text,
                      boxSizing: 'border-box'
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Rate ($/hr)"
                    value={formData.laborRate}
                    onChange={(e) => setFormData(prev => ({...prev, laborRate: e.target.value}))}
                    style={{
                      padding: '0.75rem',
                      border: `1px solid ${colors.border}`,
                      borderRadius: '0.5rem',
                      fontSize: '0.9375rem',
                      background: colors.inputBg,
                      color: colors.text,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <h4 style={{ margin: '1rem 0 0.5rem 0', fontSize: '0.875rem', fontWeight: '600', color: colors.text }}>
                  Materials
                </h4>

                {formData.materials.map((material, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                    padding: '0.75rem',
                    background: colors.bg,
                    borderRadius: '0.5rem'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: '500', color: colors.text }}>
                        {material.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: colors.subtext }}>
                        ${parseFloat(material.cost).toFixed(2)}
                      </div>
                    </div>
                    <button
                      onClick={() => removeMaterial(idx)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: '0.25rem'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <input
                    type="text"
                    placeholder="Material name"
                    value={newMaterial.name}
                    onChange={(e) => setNewMaterial(prev => ({...prev, name: e.target.value}))}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      border: `1px solid ${colors.border}`,
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      background: colors.inputBg,
                      color: colors.text,
                      boxSizing: 'border-box'
                    }}
                  />
                  <input
                    type="number"
                    placeholder="Cost"
                    value={newMaterial.cost}
                    onChange={(e) => setNewMaterial(prev => ({...prev, cost: e.target.value}))}
                    style={{
                      width: '100px',
                      padding: '0.75rem',
                      border: `1px solid ${colors.border}`,
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      background: colors.inputBg,
                      color: colors.text,
                      boxSizing: 'border-box'
                    }}
                  />
                  <button
                    onClick={addMaterial}
                    style={{
                      padding: '0.75rem',
                      background: '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <div style={{
                  padding: '0.75rem',
                  background: colors.bg,
                  borderRadius: '0.5rem',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: colors.text
                  }}>
                    <span>Total:</span>
                    <span>${currentTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={saveEstimate}
                    disabled={!formData.name}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: !formData.name ? colors.border : '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontSize: '0.9375rem',
                      fontWeight: '600',
                      cursor: !formData.name ? 'not-allowed' : 'pointer',
                      opacity: !formData.name ? 0.5 : 1
                    }}
                  >
                    {editingEstimate ? 'Update' : 'Save'} Estimate
                  </button>
                  <button
                    onClick={resetForm}
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
              </div>
            </div>
          )}
        </div>

        {/* Saved Estimates List */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          padding: '0 0.25rem'
        }}>
          <h3 style={{ 
            margin: 0, 
            color: colors.text, 
            fontSize: '1.125rem',
            fontWeight: '600'
          }}>
            Saved Estimates
          </h3>
          <span style={{
            fontSize: '0.875rem',
            color: colors.subtext,
            background: colors.cardBg,
            padding: '0.25rem 0.75rem',
            borderRadius: '1rem',
            border: `1px solid ${colors.border}`
          }}>
            {estimates.length}
          </span>
        </div>

        {estimates.length === 0 ? (
          <div style={{
            background: colors.cardBg,
            border: `1px solid ${colors.border}`,
            borderRadius: '0.75rem',
            textAlign: 'center',
            padding: '3rem 1rem',
            color: colors.subtext
          }}>
            <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p style={{ margin: 0, fontSize: '0.9375rem' }}>No estimates yet. Create one above!</p>
          </div>
        ) : (
          estimates.map((estimate) => (
            <div
              key={estimate.id}
              style={{
                background: colors.cardBg,
                border: `1px solid ${colors.border}`,
                borderRadius: '0.75rem',
                padding: '1rem',
                marginBottom: '0.75rem',
                boxShadow: 'none'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '0.75rem'
              }}>
                <div>
                  <h3 style={{
                    margin: '0 0 0.25rem 0',
                    color: colors.text,
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}>
                    {estimate.name}
                  </h3>
                  <p style={{
                    margin: 0,
                    color: colors.subtext,
                    fontSize: '0.75rem'
                  }}>
                    {estimate.createdAt.toLocaleDateString()}
                  </p>
                </div>
                <div style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#10b981'
                }}>
                  ${estimate.total.toFixed(2)}
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem',
                color: colors.subtext,
                fontSize: '0.875rem'
              }}>
                <Clock size={16} />
                <span>{estimate.laborHours}h × ${estimate.laborRate}/hr = ${(estimate.laborHours * estimate.laborRate).toFixed(2)}</span>
              </div>

              {estimate.materials.length > 0 && (
                <div style={{
                  padding: '0.75rem',
                  background: colors.bg,
                  borderRadius: '0.5rem',
                  marginBottom: '0.75rem'
                }}>
                  {estimate.materials.map((mat, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.875rem',
                      color: colors.subtext,
                      marginBottom: idx < estimate.materials.length - 1 ? '0.25rem' : 0
                    }}>
                      <span>{mat.name}</span>
                      <span>${parseFloat(mat.cost).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <button
                    onClick={() => setShowJobDropdown(showJobDropdown === estimate.id ? null : estimate.id)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      background: '#2563eb',
                      border: 'none',
                      borderRadius: '0.5rem',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                  >
                    <DollarSign size={16} />
                    Add to Job
                    <ChevronDown size={14} />
                  </button>

                  {showJobDropdown === estimate.id && (
                    <>
                      <div 
                        onClick={() => setShowJobDropdown(null)}
                        style={{
                          position: 'fixed',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          zIndex: 9998
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        bottom: '100%',
                        left: 0,
                        right: 0,
                        marginBottom: '0.5rem',
                        background: colors.cardBg,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '0.5rem',
                        boxShadow: isDarkMode ? '0 4px 12px rgba(0,0,0,0.6)' : '0 4px 12px rgba(0,0,0,0.15)',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        zIndex: 9999
                      }}>
                        <button
                          onClick={() => handleApplyToJob(estimate, 'new')}
                          style={{
                            width: '100%',
                            padding: '0.75rem',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: `1px solid ${colors.border}`,
                            color: '#2563eb',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}
                        >
                          + Create New Job
                        </button>
                        {jobs.map(job => (
                          <button
                            key={job.id}
                            onClick={() => handleApplyToJob(estimate, job.id)}
                            style={{
                              width: '100%',
                              padding: '0.75rem',
                              background: 'transparent',
                              border: 'none',
                              borderBottom: `1px solid ${colors.border}`,
                              color: colors.text,
                              cursor: 'pointer',
                              textAlign: 'left',
                              fontSize: '0.875rem'
                            }}
                          >
                            {job.title}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                
                <button
                  onClick={() => startEdit(estimate)}
                  style={{
                    padding: '0.5rem',
                    background: 'transparent',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '0.5rem',
                    color: colors.text,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => deleteEstimate(estimate.id)}
                  style={{
                    padding: '0.5rem',
                    background: 'transparent',
                    border: '1px solid #ef4444',
                    borderRadius: '0.5rem',
                    color: '#ef4444',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Estimates;