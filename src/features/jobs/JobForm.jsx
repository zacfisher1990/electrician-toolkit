import React from 'react';
import EstimateSelector from './EstimateSelector';

const JobForm = ({
  formData,
  setFormData,
  linkedEstimate,
  estimates,
  showEstimateMenu,
  setShowEstimateMenu,
  onSelectEstimate,
  onCreateNewEstimate,
  onViewEstimate,
  onRemoveEstimate,
  estimateMenuRef,
  isDarkMode,
  colors
}) => {
  return (
    <>
      <input
        type="text"
        placeholder="Job Title *"
        value={formData.title}
        onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
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

      <input
        type="text"
        placeholder="Client Name *"
        value={formData.client}
        onChange={(e) => setFormData(prev => ({...prev, client: e.target.value}))}
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

      <input
        type="text"
        placeholder="Location"
        value={formData.location}
        onChange={(e) => setFormData(prev => ({...prev, location: e.target.value}))}
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData(prev => ({...prev, date: e.target.value}))}
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
          type="time"
          value={formData.time}
          onChange={(e) => setFormData(prev => ({...prev, time: e.target.value}))}
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

      <EstimateSelector
        linkedEstimate={linkedEstimate}
        estimates={estimates}
        showMenu={showEstimateMenu}
        setShowMenu={setShowEstimateMenu}
        onSelectEstimate={onSelectEstimate}
        onCreateNewEstimate={onCreateNewEstimate}
        onViewEstimate={onViewEstimate}
        onRemoveEstimate={onRemoveEstimate}
        menuRef={estimateMenuRef}
        isDarkMode={isDarkMode}
        colors={colors}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <input
          type="number"
          placeholder="Cost ($)"
          value={formData.estimatedCost}
          onChange={(e) => setFormData(prev => ({...prev, estimatedCost: e.target.value}))}
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
          type="text"
          placeholder="Duration"
          value={formData.duration}
          onChange={(e) => setFormData(prev => ({...prev, duration: e.target.value}))}
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

      <select
        value={formData.status}
        onChange={(e) => setFormData(prev => ({...prev, status: e.target.value}))}
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
      >
        <option value="scheduled">Scheduled</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>

      <textarea
        placeholder="Notes"
        value={formData.notes}
        onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))}
        rows="3"
        style={{
          width: '100%',
          padding: '0.75rem',
          marginBottom: '0.75rem',
          border: `1px solid ${colors.border}`,
          borderRadius: '0.5rem',
          fontSize: '0.9375rem',
          background: colors.inputBg,
          color: colors.text,
          boxSizing: 'border-box',
          resize: 'vertical'
        }}
      />
    </>
  );
};

export default JobForm;