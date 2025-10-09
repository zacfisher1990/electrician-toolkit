import React, { useState } from 'react';
import { Plus, Clock, CheckCircle, AlertCircle, MapPin, Calendar, DollarSign, Edit, Trash2 } from 'lucide-react';

const Jobs = ({ isDarkMode }) => {
  const [jobs, setJobs] = useState([
    {
      id: 1,
      title: 'Residential Rewiring',
      client: 'Smith Family',
      location: '123 Main St',
      status: 'in-progress',
      date: '2024-10-08',
      estimatedCost: 3500,
      notes: 'Replace old aluminum wiring with copper'
    },
    {
      id: 2,
      title: 'Commercial Panel Upgrade',
      client: 'ABC Corp',
      location: '456 Business Ave',
      status: 'completed',
      date: '2024-10-05',
      estimatedCost: 8500,
      notes: 'Upgraded to 400A service'
    },
    {
      id: 3,
      title: 'Outlet Installation',
      client: 'Johnson Residence',
      location: '789 Oak Dr',
      status: 'scheduled',
      date: '2024-10-12',
      estimatedCost: 450,
      notes: 'Add 6 new GFCI outlets'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    client: '',
    location: '',
    status: 'scheduled',
    date: '',
    estimatedCost: '',
    notes: ''
  });

  const colors = {
    bg: isDarkMode ? '#1f2937' : '#f5f5f5',
    cardBg: isDarkMode ? '#111827' : '#ffffff',
    text: isDarkMode ? '#f9fafb' : '#111827',
    subtext: isDarkMode ? '#9ca3af' : '#6b7280',
    border: isDarkMode ? '#374151' : '#e5e7eb',
  };

  const statusConfig = {
    'scheduled': { color: '#3b82f6', icon: Clock, label: 'Scheduled' },
    'in-progress': { color: '#f59e0b', icon: AlertCircle, label: 'In Progress' },
    'completed': { color: '#10b981', icon: CheckCircle, label: 'Completed' }
  };

  const handleAddJob = () => {
    if (newJob.title && newJob.client) {
      setJobs([...jobs, { ...newJob, id: Date.now() }]);
      setNewJob({
        title: '',
        client: '',
        location: '',
        status: 'scheduled',
        date: '',
        estimatedCost: '',
        notes: ''
      });
      setShowAddForm(false);
    }
  };

  const handleDeleteJob = (id) => {
    setJobs(jobs.filter(job => job.id !== id));
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: colors.bg,
      paddingBottom: '5rem'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
        padding: '1.5rem 1rem',
        color: 'white'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.5rem', fontWeight: '600' }}>
              Job Log
            </h2>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.875rem' }}>
              {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} tracked
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              background: 'white',
              color: '#2563eb',
              border: 'none',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Plus size={24} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Add Job Form */}
      {showAddForm && (
        <div style={{
          background: colors.cardBg,
          margin: '1rem',
          padding: '1rem',
          borderRadius: '0.75rem',
          border: `1px solid ${colors.border}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: colors.text, fontSize: '1.125rem' }}>
            New Job
          </h3>
          
          <input
            type="text"
            placeholder="Job Title *"
            value={newJob.title}
            onChange={(e) => setNewJob({...newJob, title: e.target.value})}
            style={{
              width: '100%',
              padding: '0.75rem',
              marginBottom: '0.75rem',
              border: `1px solid ${colors.border}`,
              borderRadius: '0.5rem',
              fontSize: '1rem',
              background: colors.bg,
              color: colors.text,
              boxSizing: 'border-box'
            }}
          />

          <input
            type="text"
            placeholder="Client Name *"
            value={newJob.client}
            onChange={(e) => setNewJob({...newJob, client: e.target.value})}
            style={{
              width: '100%',
              padding: '0.75rem',
              marginBottom: '0.75rem',
              border: `1px solid ${colors.border}`,
              borderRadius: '0.5rem',
              fontSize: '1rem',
              background: colors.bg,
              color: colors.text,
              boxSizing: 'border-box'
            }}
          />

          <input
            type="text"
            placeholder="Location"
            value={newJob.location}
            onChange={(e) => setNewJob({...newJob, location: e.target.value})}
            style={{
              width: '100%',
              padding: '0.75rem',
              marginBottom: '0.75rem',
              border: `1px solid ${colors.border}`,
              borderRadius: '0.5rem',
              fontSize: '1rem',
              background: colors.bg,
              color: colors.text,
              boxSizing: 'border-box'
            }}
          />

          <input
            type="date"
            value={newJob.date}
            onChange={(e) => setNewJob({...newJob, date: e.target.value})}
            style={{
              width: '100%',
              padding: '0.75rem',
              marginBottom: '0.75rem',
              border: `1px solid ${colors.border}`,
              borderRadius: '0.5rem',
              fontSize: '1rem',
              background: colors.bg,
              color: colors.text,
              boxSizing: 'border-box'
            }}
          />

          <input
            type="number"
            placeholder="Estimated Cost ($)"
            value={newJob.estimatedCost}
            onChange={(e) => setNewJob({...newJob, estimatedCost: e.target.value})}
            style={{
              width: '100%',
              padding: '0.75rem',
              marginBottom: '0.75rem',
              border: `1px solid ${colors.border}`,
              borderRadius: '0.5rem',
              fontSize: '1rem',
              background: colors.bg,
              color: colors.text,
              boxSizing: 'border-box'
            }}
          />

          <select
            value={newJob.status}
            onChange={(e) => setNewJob({...newJob, status: e.target.value})}
            style={{
              width: '100%',
              padding: '0.75rem',
              marginBottom: '0.75rem',
              border: `1px solid ${colors.border}`,
              borderRadius: '0.5rem',
              fontSize: '1rem',
              background: colors.bg,
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
            value={newJob.notes}
            onChange={(e) => setNewJob({...newJob, notes: e.target.value})}
            rows="3"
            style={{
              width: '100%',
              padding: '0.75rem',
              marginBottom: '0.75rem',
              border: `1px solid ${colors.border}`,
              borderRadius: '0.5rem',
              fontSize: '1rem',
              background: colors.bg,
              color: colors.text,
              boxSizing: 'border-box',
              resize: 'vertical'
            }}
          />

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleAddJob}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Add Job
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: 'transparent',
                color: colors.text,
                border: `1px solid ${colors.border}`,
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Job List */}
      <div style={{ padding: '1rem' }}>
        {jobs.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            color: colors.subtext
          }}>
            <Briefcase size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <p>No jobs yet. Click the + button to add your first job!</p>
          </div>
        ) : (
          jobs.map((job) => {
            const StatusIcon = statusConfig[job.status].icon;
            return (
              <div
                key={job.id}
                style={{
                  background: colors.cardBg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  marginBottom: '0.75rem',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
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
                      fontSize: '1.125rem',
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
                    fontWeight: '600'
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
                    <span>{new Date(job.date).toLocaleDateString()}</span>
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
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      background: 'transparent',
                      border: `1px solid ${colors.border}`,
                      borderRadius: '0.5rem',
                      color: colors.text,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.25rem',
                      fontSize: '0.875rem'
                    }}
                  >
                    <Edit size={16} />
                    Edit
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