import React, { useState } from 'react';
import { Plus, Clock, CheckCircle, AlertCircle, MapPin, Calendar, DollarSign, Edit, Trash2, Briefcase, ChevronDown } from 'lucide-react';

const Jobs = ({ isDarkMode }) => {
  const [jobs, setJobs] = useState([
    {
      id: 1,
      title: 'Residential Rewiring',
      client: 'Smith Family',
      location: '123 Main St',
      status: 'in-progress',
      date: '2024-10-07',
      estimatedCost: 3500,
      notes: 'Replace old aluminum wiring with copper'
    },
    {
      id: 2,
      title: 'Commercial Panel Upgrade',
      client: 'ABC Corp',
      location: '456 Business Ave',
      status: 'completed',
      date: '2024-10-04',
      estimatedCost: 8500,
      notes: 'Upgraded to 400A service'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    location: '',
    status: 'scheduled',
    date: '',
    estimatedCost: '',
    notes: ''
  });

  const colors = {
    bg: isDarkMode ? '#1f2937' : '#f9fafb',
    cardBg: isDarkMode ? '#374151' : '#ffffff',
    text: isDarkMode ? '#f9fafb' : '#111827',
    subtext: isDarkMode ? '#9ca3af' : '#6b7280',
    border: isDarkMode ? '#4b5563' : '#e5e7eb',
    inputBg: isDarkMode ? '#1f2937' : '#ffffff',
  };

  const statusConfig = {
    'scheduled': { color: '#3b82f6', icon: Clock, label: 'Scheduled' },
    'in-progress': { color: '#f59e0b', icon: AlertCircle, label: 'In Progress' },
    'completed': { color: '#10b981', icon: CheckCircle, label: 'Completed' }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      client: '',
      location: '',
      status: 'scheduled',
      date: '',
      estimatedCost: '',
      notes: ''
    });
    setShowAddForm(false);
    setEditingJob(null);
  };

  const handleAddJob = () => {
    if (formData.title && formData.client) {
      setJobs([...jobs, { ...formData, id: Date.now() }]);
      resetForm();
    }
  };

  const handleEditJob = () => {
    if (formData.title && formData.client) {
      setJobs(jobs.map(job => 
        job.id === editingJob.id ? { ...formData, id: job.id } : job
      ));
      resetForm();
    }
  };

  const startEdit = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      client: job.client,
      location: job.location,
      status: job.status,
      date: job.date,
      estimatedCost: job.estimatedCost,
      notes: job.notes
    });
    setShowAddForm(true);
    // Scroll to top to show the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteJob = (id) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      setJobs(jobs.filter(job => job.id !== id));
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: colors.bg,
      paddingBottom: '5rem'
    }}>
      <div style={{ padding: '1rem' }}>
        {/* Add New Job Button/Form */}
        <div style={{
          background: colors.cardBg,
          borderRadius: '0.75rem',
          border: `1px solid ${colors.border}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '1rem',
          overflow: 'hidden'
        }}>
          {/* Header Button */}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
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
              {editingJob ? 'Edit Job' : 'Add New Job'}
            </div>
            <ChevronDown 
              size={20} 
              style={{
                transform: showAddForm ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s'
              }}
            />
          </button>

          {/* Expandable Form */}
          {showAddForm && (
            <div style={{
              padding: '0 1rem 1rem 1rem',
              borderTop: `1px solid ${colors.border}`
            }}>
              <div style={{ paddingTop: '1rem' }}>
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

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={editingJob ? handleEditJob : handleAddJob}
                    disabled={!formData.title || !formData.client}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: (!formData.title || !formData.client) ? colors.border : '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.5rem',
                      fontSize: '0.9375rem',
                      fontWeight: '600',
                      cursor: (!formData.title || !formData.client) ? 'not-allowed' : 'pointer',
                      opacity: (!formData.title || !formData.client) ? 0.5 : 1
                    }}
                  >
                    {editingJob ? 'Update Job' : 'Add Job'}
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

        {/* Section Header */}
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
            Job List
          </h3>
          <span style={{
            fontSize: '0.875rem',
            color: colors.subtext,
            background: colors.cardBg,
            padding: '0.25rem 0.75rem',
            borderRadius: '1rem',
            border: `1px solid ${colors.border}`
          }}>
            {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}
          </span>
        </div>

        {/* Job List */}
        {jobs.length === 0 ? (
          <div style={{
            background: colors.cardBg,
            border: `1px solid ${colors.border}`,
            borderRadius: '0.75rem',
            textAlign: 'center',
            padding: '3rem 1rem',
            color: colors.subtext
          }}>
            <Briefcase size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p style={{ margin: 0, fontSize: '0.9375rem' }}>No jobs yet. Add your first job above!</p>
          </div>
        ) : (
          [...jobs]
            .sort((a, b) => {
              // Sort by date: newest first (if no date, put at end)
              if (!a.date && !b.date) return 0;
              if (!a.date) return 1;
              if (!b.date) return -1;
              return new Date(b.date) - new Date(a.date);
            })
            .map((job) => {
            const StatusIcon = statusConfig[job.status].icon;
            const isEditing = editingJob && editingJob.id === job.id;
            
            return (
              <div
                key={job.id}
                style={{
                  background: colors.cardBg,
                  border: `1px solid ${isEditing ? '#3b82f6' : colors.border}`,
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  marginBottom: '0.75rem',
                  boxShadow: isEditing ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : '0 1px 3px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      margin: '0 0 0.25rem 0',
                      color: colors.text,
                      fontSize: '1rem',
                      fontWeight: '600'
                    }}>
                      {job.title}
                    </h3>
                    <p style={{
                      margin: 0,
                      color: colors.subtext,
                      fontSize: '0.875rem'
                    }}>
                      {job.client}
                    </p>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '1rem',
                    background: `${statusConfig[job.status].color}20`,
                    color: statusConfig[job.status].color,
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    whiteSpace: 'nowrap'
                  }}>
                    <StatusIcon size={14} />
                    <span>{statusConfig[job.status].label}</span>
                  </div>
                </div>

                {job.location && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                    color: colors.subtext,
                    fontSize: '0.875rem'
                  }}>
                    <MapPin size={16} />
                    <span>{job.location}</span>
                  </div>
                )}

                {job.date && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                    color: colors.subtext,
                    fontSize: '0.875rem'
                  }}>
                    <Calendar size={16} />
                    <span>{new Date(job.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                )}

                {job.estimatedCost && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                    color: colors.subtext,
                    fontSize: '0.875rem'
                  }}>
                    <DollarSign size={16} />
                    <span>${Number(job.estimatedCost).toLocaleString()}</span>
                  </div>
                )}

                {job.notes && (
                  <p style={{
                    margin: '0.75rem 0 0 0',
                    padding: '0.75rem',
                    background: colors.bg,
                    borderRadius: '0.5rem',
                    color: colors.text,
                    fontSize: '0.875rem',
                    lineHeight: '1.5'
                  }}>
                    {job.notes}
                  </p>
                )}

                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginTop: '0.75rem'
                }}>
                  <button
                    onClick={() => startEdit(job)}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      background: isEditing ? '#3b82f6' : 'transparent',
                      border: `1px solid ${isEditing ? '#3b82f6' : colors.border}`,
                      borderRadius: '0.5rem',
                      color: isEditing ? 'white' : colors.text,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                      fontSize: '0.875rem',
                      fontWeight: isEditing ? '600' : '400'
                    }}
                  >
                    <Edit size={16} />
                    {isEditing ? 'Editing...' : 'Edit'}
                  </button>
                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      background: 'transparent',
                      border: '1px solid #ef4444',
                      borderRadius: '0.5rem',
                      color: '#ef4444',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                      fontSize: '0.875rem'
                    }}
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Jobs;