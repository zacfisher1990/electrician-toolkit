import React, { useState, useEffect } from 'react';
import { FileText, Briefcase } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import { getUserInvoices, createInvoice, updateInvoice, deleteInvoice } from './invoicesService';
import { saveInvoices, getInvoices, clearInvoicesCache } from '../../utils/localStorageUtils';
import InvoiceForm from './InvoiceForm';

function Invoices({ isDarkMode = false, estimates = [], jobs = [] }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [attachingInvoice, setAttachingInvoice] = useState(null);
  const [showJobSelector, setShowJobSelector] = useState(false);

  const colors = {
    bg: isDarkMode ? '#000000' : '#f9fafb',
    cardBg: isDarkMode ? '#111111' : '#ffffff',
    border: isDarkMode ? '#1a1a1a' : '#e5e7eb',
    text: isDarkMode ? '#ffffff' : '#111827',
    textSecondary: isDarkMode ? '#9ca3af' : '#6b7280',
    buttonBg: '#3b82f6',
    buttonText: '#ffffff',
    paidBg: isDarkMode ? '#064e3b' : '#d1fae5',
    paidText: isDarkMode ? '#6ee7b7' : '#065f46',
    pendingBg: isDarkMode ? '#78350f' : '#fef3c7',
    pendingText: isDarkMode ? '#fcd34d' : '#92400e',
    overdueBg: isDarkMode ? '#7f1d1d' : '#fee2e2',
    overdueText: isDarkMode ? '#fca5a5' : '#991b1b'
  };

  // Load invoices from Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadInvoices();
      } else {
        setLoading(false);
        clearInvoicesCache();
      }
    });
    return () => unsubscribe();
  }, []);

  const loadInvoices = async () => {
    try {
      // First, load from cache for instant display
      const cachedInvoices = getInvoices();
      if (cachedInvoices) {
        setInvoices(cachedInvoices);
        setLoading(false);
      }

      // Then fetch fresh data from Firebase
      const userInvoices = await getUserInvoices();
      setInvoices(userInvoices);
      
      // Save fresh data to cache
      saveInvoices(userInvoices);
    } catch (error) {
      console.error('Error loading invoices:', error);
      
      const cachedInvoices = getInvoices();
      if (cachedInvoices && cachedInvoices.length > 0) {
        console.log('Using cached invoices due to error');
      } else {
        alert('Failed to load invoices. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const saveInvoice = async (invoiceData) => {
    try {
      if (editingInvoice) {
        await updateInvoice(editingInvoice.id, invoiceData);
      } else {
        await createInvoice(invoiceData);
      }
      
      setEditingInvoice(null);
      clearInvoicesCache();
      loadInvoices();
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('Failed to save invoice. Please try again.');
    }
  };

  const startEdit = (invoice) => {
    setEditingInvoice(invoice);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingInvoice(null);
  };

  const handleDeleteInvoice = async (id, invoiceNumber) => {
    if (window.confirm(`Delete invoice ${invoiceNumber}?`)) {
      try {
        await deleteInvoice(id);
        clearInvoicesCache();
        loadInvoices();
      } catch (error) {
        console.error('Error deleting invoice:', error);
        alert('Failed to delete invoice. Please try again.');
      }
    }
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case 'Paid':
        return {
          background: colors.paidBg,
          color: colors.paidText
        };
      case 'Pending':
        return {
          background: colors.pendingBg,
          color: colors.pendingText
        };
      case 'Overdue':
        return {
          background: colors.overdueBg,
          color: colors.overdueText
        };
      default:
        return {};
    }
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: colors.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: '5rem'
      }}>
        <div style={{ color: colors.textSecondary }}>Loading invoices...</div>
      </div>
    );
  }

  const handleAttachToJob = (invoice, e) => {
  e.stopPropagation(); // Prevent card click
  setAttachingInvoice(invoice);
  setShowJobSelector(true);
};

const handleSelectJob = async (jobId) => {
  if (!attachingInvoice) return;
  
  try {
    // Update invoice with jobId
    await updateInvoice(attachingInvoice.id, {
      ...attachingInvoice,
      jobId: jobId
    });
    
    // Also update the job with invoiceId
    const { updateJob } = await import('../jobs/jobsService');
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      await updateJob(jobId, {
        ...job,
        invoiceId: attachingInvoice.id
      });
    }
    
    setShowJobSelector(false);
    setAttachingInvoice(null);
    clearInvoicesCache();
    loadInvoices();
    
    alert('Invoice attached to job successfully!');
  } catch (error) {
    console.error('Error attaching invoice to job:', error);
    alert('Failed to attach invoice. Please try again.');
  }
};

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.bg,
      paddingTop: '1rem',
      paddingBottom: '5rem' 
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 0.25rem'
      }}>
        {/* Header Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '0.5rem',
          marginBottom: '1rem'
        }}>
          <div style={{
            background: colors.cardBg,
            border: `1px solid ${colors.border}`,
            borderRadius: '0.5rem',
            padding: '0.75rem',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '0.75rem',
              color: colors.textSecondary,
              marginBottom: '0.25rem'
            }}>
              Total
            </div>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: colors.text
            }}>
              {invoices.length}
            </div>
          </div>

          <div style={{
            background: colors.cardBg,
            border: `1px solid ${colors.border}`,
            borderRadius: '0.5rem',
            padding: '0.75rem',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '0.75rem',
              color: colors.textSecondary,
              marginBottom: '0.25rem'
            }}>
              Paid
            </div>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: colors.paidText
            }}>
              {invoices.filter(inv => inv.status === 'Paid').length}
            </div>
          </div>

          <div style={{
            background: colors.cardBg,
            border: `1px solid ${colors.border}`,
            borderRadius: '0.5rem',
            padding: '0.75rem',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '0.75rem',
              color: colors.textSecondary,
              marginBottom: '0.25rem'
            }}>
              Pending
            </div>
            <div style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: colors.pendingText
            }}>
              {invoices.filter(inv => inv.status === 'Pending').length}
            </div>
          </div>
        </div>

        

        {/* Invoice Form */}
        <InvoiceForm
          isDarkMode={isDarkMode}
          editingInvoice={editingInvoice}
          onSave={saveInvoice}
          onCancel={cancelEdit}
          estimates={estimates}
          jobs={jobs}
          invoices={invoices}
        />

        {/* Invoices List */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          {invoices.length === 0 ? (
            <div style={{
              background: colors.cardBg,
              border: `1px solid ${colors.border}`,
              borderRadius: '0.75rem',
              padding: '3rem 1rem',
              textAlign: 'center'
            }}>
              <FileText 
                size={48} 
                color={colors.textSecondary} 
                style={{ margin: '0 auto 1rem' }}
              />
              <p style={{
                color: colors.textSecondary,
                fontSize: '0.875rem',
                margin: 0
              }}>
                No invoices yet. Create your first invoice!
              </p>
            </div>
          ) : (
            invoices.map(invoice => (
              <div
                key={invoice.id}
                onClick={() => startEdit(invoice)} 
                style={{
                  background: colors.cardBg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.75rem'
                }}>
                  <div>
                    <div style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: colors.text,
                      marginBottom: '0.25rem'
                    }}>
                      {invoice.invoiceNumber}
                    </div>
                    <div style={{
                      fontSize: '0.875rem',
                      color: colors.textSecondary
                    }}>
                      {invoice.client}
                    </div>
                  </div>
                  <div style={{
                    ...getStatusStyle(invoice.status),
                    padding: '0.25rem 0.75rem',
                    borderRadius: '1rem',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    {invoice.status}
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '0.75rem',
                  borderTop: `1px solid ${colors.border}`
                }}>
                  <div style={{
                    fontSize: '0.875rem',
                    color: colors.textSecondary
                  }}>
                    {new Date(invoice.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                  <div style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: colors.text
                  }}>
                    ${invoice.amount.toFixed(2)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
{/* Job Selector Modal */}
{showJobSelector && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem'
  }}>
    <div style={{
      background: colors.cardBg,
      borderRadius: '0.75rem',
      padding: '1.5rem',
      maxWidth: '500px',
      width: '100%',
      maxHeight: '80vh',
      overflow: 'auto'
    }}>
      <h3 style={{
        margin: '0 0 1rem 0',
        color: colors.text,
        fontSize: '1.125rem',
        fontWeight: '600'
      }}>
        Attach to Job
      </h3>
      
      {jobs.length === 0 ? (
        <p style={{
          color: colors.textSecondary,
          fontSize: '0.875rem',
          textAlign: 'center',
          padding: '2rem 0'
        }}>
          No jobs available. Create a job first.
        </p>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          {jobs.map(job => (
            <button
              key={job.id}
              onClick={() => handleSelectJob(job.id)}
              style={{
                padding: '1rem',
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                borderRadius: '0.5rem',
                color: colors.text,
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{
                  fontWeight: '600',
                  fontSize: '0.9375rem',
                  marginBottom: '0.25rem'
                }}>
                  {job.title || job.name}
                </div>
                <div style={{
                  fontSize: '0.8125rem',
                  color: colors.textSecondary
                }}>
                  {job.client}
                </div>
              </div>
              {job.invoiceId && (
                <span style={{
                  fontSize: '0.75rem',
                  color: colors.textSecondary
                }}>
                  (Has invoice)
                </span>
              )}
            </button>
          ))}
        </div>
      )}
      
      <button
        onClick={() => {
          setShowJobSelector(false);
          setAttachingInvoice(null);
        }}
        style={{
          width: '100%',
          marginTop: '1rem',
          padding: '0.75rem',
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
    </div>
  </div>
)}

    </div>
  );
}

export default Invoices;