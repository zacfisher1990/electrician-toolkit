// src/features/invoices/InvoiceForm.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, Check, X } from 'lucide-react';

const InvoiceForm = ({ 
  isDarkMode, 
  editingInvoice,
  onSave,
  onCancel,
  jobs = [],
  estimates = [],
  invoices = []
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    invoiceNumber: editingInvoice?.invoiceNumber || '',
    client: editingInvoice?.client || '',
    clientEmail: editingInvoice?.clientEmail || '',
    date: editingInvoice?.date || new Date().toISOString().split('T')[0],
    dueDate: editingInvoice?.dueDate || '',
    lineItems: editingInvoice?.lineItems || [],
    notes: editingInvoice?.notes || '',
    status: editingInvoice?.status || 'Pending',
    jobId: editingInvoice?.jobId || null 
  });
  const [newLineItem, setNewLineItem] = useState({ description: '', quantity: '1', rate: '' });

  const colors = {
    bg: isDarkMode ? '#000000' : '#f9fafb',
    cardBg: isDarkMode ? '#1a1a1a' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#111827',
    subtext: isDarkMode ? '#999999' : '#6b7280',
    border: isDarkMode ? '#2a2a2a' : '#e5e7eb',
    inputBg: isDarkMode ? '#000000' : '#ffffff',
  };

  // Open form if editing
  useEffect(() => {
    if (editingInvoice) {
      setFormData({
        invoiceNumber: editingInvoice.invoiceNumber,
        client: editingInvoice.client,
        clientEmail: editingInvoice.clientEmail || '',
        date: editingInvoice.date,
        dueDate: editingInvoice.dueDate || '',
        lineItems: [...editingInvoice.lineItems],
        notes: editingInvoice.notes || '',
        status: editingInvoice.status,
        jobId: editingInvoice.jobId || null
      });
      setShowForm(true);
    }
  }, [editingInvoice]);

// Generate next invoice number
    useEffect(() => {
    const generateInvoiceNumber = async () => {
        if (!editingInvoice && showForm && !formData.invoiceNumber) {
        try {
            const { getNextInvoiceNumber } = await import('./invoicesService');
            const nextNumber = await getNextInvoiceNumber();
            setFormData(prev => ({ ...prev, invoiceNumber: nextNumber }));
        } catch (error) {
            console.error('Error generating invoice number:', error);
            // Fallback to timestamp if error
            const fallbackNumber = `INV-${String(Date.now()).slice(-6)}`;
            setFormData(prev => ({ ...prev, invoiceNumber: fallbackNumber }));
        }
        }
    };
    
    generateInvoiceNumber();
    }, [showForm, editingInvoice, formData.invoiceNumber]);

  const calculateTotal = (lineItems) => {
    return lineItems.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      return sum + (quantity * rate);
    }, 0);
  };

  const addLineItem = () => {
    if (newLineItem.description && newLineItem.quantity && newLineItem.rate) {
      setFormData(prev => ({
        ...prev,
        lineItems: [...prev.lineItems, { ...newLineItem }]
      }));
      setNewLineItem({ description: '', quantity: '1', rate: '' });
    }
  };

  const removeLineItem = (index) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    if (formData.invoiceNumber && formData.client && formData.lineItems.length > 0) {
      const total = calculateTotal(formData.lineItems);
      
      const invoiceData = {
        ...formData,
        amount: total
      };

      onSave(invoiceData);
      handleReset();
    }
  };

  const handleReset = () => {
    setFormData({ 
      invoiceNumber: '', 
      client: '', 
      clientEmail: '',
      date: new Date().toISOString().split('T')[0], 
      dueDate: '',
      lineItems: [], 
      notes: '',
      status: 'Pending',
      jobId: null 
    });
    setShowForm(false);
  };

  const handleCancel = () => {
    handleReset();
    if (onCancel) onCancel();
  };

  const loadFromEstimate = (estimateId) => {
    const estimate = estimates.find(e => e.id === estimateId);
    if (!estimate) return;

    const lineItems = [
      {
        description: `Labor: ${estimate.laborHours}h @ $${estimate.laborRate}/hr`,
        quantity: 1,
        rate: estimate.laborHours * estimate.laborRate
      },
      ...estimate.materials.map(mat => ({
        description: mat.name,
        quantity: mat.quantity || 1,
        rate: parseFloat(mat.cost) || 0
      }))
    ];

    setFormData(prev => ({
      ...prev,
      lineItems: lineItems,
      notes: `Based on estimate: ${estimate.name}`
    }));
  };

  const currentTotal = calculateTotal(formData.lineItems);

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
          {editingInvoice ? 'Edit Invoice' : 'New Invoice'}
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
          padding: '1rem 0',
          borderTop: `1px solid ${colors.border}`
        }}>
          {/* Invoice Number and Client - Two Columns */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '0.75rem',
            marginBottom: '0.75rem'
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.25rem',
                color: colors.subtext,
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                Invoice Number *
              </label>
              <input
                type="text"
                placeholder="INV-001"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
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

            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.25rem',
                color: colors.subtext,
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                Client Name *
              </label>
              <input
                type="text"
                placeholder="Client name"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
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
          </div>

          {/* Client Email */}
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.25rem',
              color: colors.subtext,
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              Client Email
            </label>
            <input
              type="email"
              placeholder="client@example.com"
              value={formData.clientEmail}
              onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
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

          {/* Date and Due Date */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '0.75rem',
            marginBottom: '0.75rem'
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.25rem',
                color: colors.subtext,
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                Invoice Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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

            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.25rem',
                color: colors.subtext,
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
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
          </div>

          {/* Load from Estimate */}
          {estimates.length > 0 && (
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.25rem',
                color: colors.subtext,
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                Load from Estimate (optional)
              </label>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    loadFromEstimate(e.target.value);
                    e.target.value = ''; // Reset select
                  }
                }}
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
              >
                <option value="">Select an estimate...</option>
                {estimates.map(est => (
                  <option key={est.id} value={est.id}>
                    {est.name} - ${est.total.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Link to Job */}
            {jobs.length > 0 && (
            <div style={{ marginBottom: '0.75rem' }}>
                <label style={{
                display: 'block',
                marginBottom: '0.25rem',
                color: colors.subtext,
                fontSize: '0.875rem',
                fontWeight: '500'
                }}>
                Link to Job (optional)
                </label>
                <select
                value={formData.jobId || ''}
                onChange={(e) => {
                    const selectedJobId = e.target.value;
                    setFormData({ ...formData, jobId: selectedJobId || null });
                    
                    // Auto-fill client name from job if not already filled
                    if (selectedJobId && !formData.client) {
                    const selectedJob = jobs.find(j => j.id === selectedJobId);
                    if (selectedJob) {
                        setFormData(prev => ({
                        ...prev,
                        jobId: selectedJobId,
                        client: selectedJob.client
                        }));
                    }
                    }
                }}
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
                >
                <option value="">None - Standalone invoice</option>
                {jobs.map(job => (
                    <option key={job.id} value={job.id}>
                    {job.title || job.name} - {job.client}
                    </option>
                ))}
                </select>
                {formData.jobId && (
                <div style={{
                    marginTop: '0.25rem',
                    fontSize: '0.75rem',
                    color: '#10b981',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                }}>
                    ✓ Invoice will be linked to this job
                </div>
                )}
            </div>
            )}

          {/* Line Items Section */}
          <div style={{
            padding: '0.75rem 0.25rem',
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
              Line Items *
            </p>

            {/* Existing Line Items */}
            {formData.lineItems.map((item, idx) => {
              const quantity = parseFloat(item.quantity) || 1;
              const rate = parseFloat(item.rate) || 0;
              const lineTotal = quantity * rate;

              return (
                <div key={idx} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '0.5rem',
                  background: colors.cardBg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.25rem'
                  }}>
                    <span style={{ 
                      color: colors.text, 
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      flex: 1
                    }}>
                      {item.description}
                    </span>
                    <button
                      onClick={() => removeLineItem(idx)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        marginLeft: '0.5rem'
                      }}
                      aria-label={`Remove ${item.description}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.75rem',
                    color: colors.subtext
                  }}>
                    <span>{quantity > 1 ? `${quantity} × $${rate.toFixed(2)}` : ''}</span>
                    <span style={{ fontWeight: '600', color: colors.text }}>
                      ${lineTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Add New Line Item */}
            <div style={{ marginTop: '0.5rem' }}>
              <input
                type="text"
                placeholder="Description"
                value={newLineItem.description}
                onChange={(e) => setNewLineItem({ ...newLineItem, description: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && addLineItem()}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  marginBottom: '0.5rem',
                  background: colors.cardBg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '0.5rem',
                  color: colors.text,
                  fontSize: '0.875rem',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="number"
                  placeholder="Qty"
                  value={newLineItem.quantity}
                  onChange={(e) => setNewLineItem({ ...newLineItem, quantity: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && addLineItem()}
                  min="1"
                  style={{
                    width: '60px',
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
                <input
                  type="number"
                  placeholder="Rate"
                  value={newLineItem.rate}
                  onChange={(e) => setNewLineItem({ ...newLineItem, rate: e.target.value })}
                  onKeyPress={(e) => e.key === 'Enter' && addLineItem()}
                  step="0.01"
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
                <button
                  onClick={addLineItem}
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
                  aria-label="Add line item"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.25rem',
              color: colors.subtext,
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              Notes
            </label>
            <textarea
              placeholder="Additional notes or payment terms..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: colors.inputBg,
                border: `1px solid ${colors.border}`,
                borderRadius: '0.5rem',
                color: colors.text,
                fontSize: '0.875rem',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
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
              Total Amount
            </span>
            <span style={{ color: '#10b981', fontSize: '1.25rem', fontWeight: '700' }}>
              ${currentTotal.toFixed(2)}
            </span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleSave}
              disabled={!formData.invoiceNumber || !formData.client || formData.lineItems.length === 0}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: (formData.invoiceNumber && formData.client && formData.lineItems.length > 0) 
                  ? '#10b981' 
                  : colors.border,
                border: 'none',
                borderRadius: '0.5rem',
                color: 'white',
                cursor: (formData.invoiceNumber && formData.client && formData.lineItems.length > 0)
                  ? 'pointer' 
                  : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '0.9375rem',
                fontWeight: '600'
              }}
            >
              <Check size={18} />
              {editingInvoice ? 'Update' : 'Create'} Invoice
            </button>
            {(editingInvoice || showForm) && (
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

export default InvoiceForm;