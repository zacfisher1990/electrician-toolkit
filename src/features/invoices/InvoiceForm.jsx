// src/features/invoices/InvoiceForm.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import LineItemAutocomplete from './LineItemAutocomplete';

const InvoiceForm = ({ 
  isDarkMode, 
  editingInvoice,
  onSave,
  onCancel,
  jobs = [],
  estimates = []
}) => {
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
  const [savedLineItems, setSavedLineItems] = useState([]);

  const colors = {
    bg: isDarkMode ? '#000000' : '#f9fafb',
    cardBg: isDarkMode ? '#1a1a1a' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#111827',
    subtext: isDarkMode ? '#999999' : '#6b7280',
    border: isDarkMode ? '#2a2a2a' : '#e5e7eb',
    inputBg: isDarkMode ? '#000000' : '#ffffff',
  };

  // Label style (matching EstimateForm)
  const labelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: colors.text,
    marginBottom: '0.375rem'
  };

  // Input style (matching EstimateForm)
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

  // Update form when editing invoice changes
  useEffect(() => {
    if (editingInvoice) {
      setFormData({
        invoiceNumber: editingInvoice.invoiceNumber || '',
        client: editingInvoice.client || '',
        clientEmail: editingInvoice.clientEmail || '',
        date: editingInvoice.date || new Date().toISOString().split('T')[0],
        dueDate: editingInvoice.dueDate || '',
        lineItems: editingInvoice.lineItems || [],
        notes: editingInvoice.notes || '',
        status: editingInvoice.status || 'Pending',
        jobId: editingInvoice.jobId || null
      });
    }
  }, [editingInvoice]);

  // Generate next invoice number
  useEffect(() => {
    const generateInvoiceNumber = async () => {
      if (!editingInvoice && !formData.invoiceNumber) {
        try {
          const { getNextInvoiceNumber } = await import('./invoicesService');
          const nextNumber = await getNextInvoiceNumber();
          setFormData(prev => ({ ...prev, invoiceNumber: nextNumber }));
        } catch (error) {
          console.error('Error generating invoice number:', error);
          const fallbackNumber = `INV-${String(Date.now()).slice(-6)}`;
          setFormData(prev => ({ ...prev, invoiceNumber: fallbackNumber }));
        }
      }
    };
    
    generateInvoiceNumber();
  }, [editingInvoice, formData.invoiceNumber]);

  const calculateTotal = (lineItems) => {
    return lineItems.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      return sum + (quantity * rate);
    }, 0);
  };

  const addLineItem = (newItem) => {
    setFormData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, { ...newItem }]
    }));
    
    // TODO: Save to user's line items database for future autocomplete
    // Similar to how materials are saved in estimatesService
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
        amount: total,
        subtotal: total, 
        total: total  
      };

      onSave(invoiceData);
    }
  };

  const loadFromEstimate = (estimateId) => {
    const estimate = estimates.find(e => e.id === estimateId);
    if (!estimate) return;

    const lineItems = [];
    
    // Add labor if exists
    if (estimate.laborHours && estimate.laborRate) {
      lineItems.push({
        description: `Labor: ${estimate.laborHours}h @ $${estimate.laborRate}/hr`,
        quantity: 1,
        rate: estimate.laborHours * estimate.laborRate
      });
    }
    
    // Add materials
    if (estimate.materials) {
      estimate.materials.forEach(mat => {
        lineItems.push({
          description: mat.name,
          quantity: mat.quantity || 1,
          rate: parseFloat(mat.cost) || 0
        });
      });
    }
    
    // Add additional items
    if (estimate.additionalItems) {
      estimate.additionalItems.forEach(item => {
        lineItems.push({
          description: item.description,
          quantity: 1,
          rate: parseFloat(item.amount) || 0
        });
      });
    }

    setFormData(prev => ({
      ...prev,
      lineItems: lineItems,
      notes: `Based on estimate: ${estimate.name}`
    }));
  };

  const currentTotal = calculateTotal(formData.lineItems);

  return (
    <>
      {/* Invoice Number and Client - Two Columns */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '0.75rem',
        marginBottom: '0.75rem'
      }}>
        <div>
          <label style={labelStyle}>
            Invoice Number <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            placeholder="INV-001"
            value={formData.invoiceNumber}
            onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>
            Client Name <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            placeholder="Client name"
            value={formData.client}
            onChange={(e) => setFormData({ ...formData, client: e.target.value })}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Client Email */}
      <div style={{ marginBottom: '0.75rem' }}>
        <label style={labelStyle}>Client Email</label>
        <input
          type="email"
          placeholder="client@example.com"
          value={formData.clientEmail}
          onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
          style={inputStyle}
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
          <label style={labelStyle}>
            Invoice Date <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Due Date</label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Load from Estimate */}
      {estimates.length > 0 && (
        <div style={{ marginBottom: '0.75rem' }}>
          <label style={labelStyle}>Load from Estimate</label>
          <select
            onChange={(e) => {
              if (e.target.value) {
                loadFromEstimate(e.target.value);
                e.target.value = '';
              }
            }}
            style={inputStyle}
          >
            <option value="">Select an estimate...</option>
            {estimates.map(est => (
              <option key={est.id} value={est.id}>
                {est.name} - ${est.total?.toFixed(2) || '0.00'}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Link to Job */}
      {jobs.length > 0 && (
        <div style={{ marginBottom: '0.75rem' }}>
          <label style={labelStyle}>Link to Job</label>
          <select
            value={formData.jobId || ''}
            onChange={(e) => {
              const selectedJobId = e.target.value;
              setFormData({ ...formData, jobId: selectedJobId || null });
              
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
            style={inputStyle}
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
      <div style={{ marginBottom: '0.75rem' }}>
        <label style={labelStyle}>
          Line Items <span style={{ color: '#ef4444' }}>*</span>
        </label>

        {/* Existing Line Items */}
        {formData.lineItems.length > 0 && (
          <div style={{ marginBottom: '0.5rem' }}>
            {formData.lineItems.map((item, idx) => {
              const quantity = parseFloat(item.quantity) || 1;
              const rate = parseFloat(item.rate) || 0;
              const lineTotal = quantity * rate;

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
                    {item.description} {quantity > 1 ? `x${quantity}` : ''}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ color: colors.text, fontSize: '0.875rem', fontWeight: '600' }}>
                      ${lineTotal.toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeLineItem(idx)}
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
              );
            })}
          </div>
        )}

        {/* Add New Line Item - Using Autocomplete */}
        <LineItemAutocomplete
          savedLineItems={savedLineItems}
          onAdd={addLineItem}
          isDarkMode={isDarkMode}
          colors={colors}
        />
      </div>

      {/* Notes */}
      <div style={{ marginBottom: '0.75rem' }}>
        <label style={labelStyle}>Notes</label>
        <textarea
          placeholder="Additional notes or payment terms..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          style={{
            ...inputStyle,
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

      {/* Action Buttons - Matching EstimateForm exact style */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={handleSave}
          disabled={!formData.invoiceNumber || !formData.client || formData.lineItems.length === 0}
          style={{
            flex: 1,
            padding: '0.75rem',
            background: (!formData.invoiceNumber || !formData.client || formData.lineItems.length === 0) 
              ? colors.border 
              : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.9375rem',
            fontWeight: '600',
            cursor: (!formData.invoiceNumber || !formData.client || formData.lineItems.length === 0) 
              ? 'not-allowed' 
              : 'pointer',
            opacity: (!formData.invoiceNumber || !formData.client || formData.lineItems.length === 0) ? 0.5 : 1
          }}
        >
          {editingInvoice ? 'Save Changes' : 'Create Invoice'}
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

export default InvoiceForm;