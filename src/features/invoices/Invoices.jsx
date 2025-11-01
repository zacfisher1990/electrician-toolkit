import React, { useState, useEffect } from 'react';
import { FileText, Briefcase, Search, X } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import { getUserInvoices, createInvoice, updateInvoice, deleteInvoice } from './invoicesService';
import { saveInvoices, getInvoices, clearInvoicesCache } from '../../utils/localStorageUtils';
import InvoiceForm from './InvoiceForm';
import InvoiceCard from './InvoiceCard';
import SendInvoiceModal from './SendInvoiceModal';
import { sendInvoiceViaEmail, downloadInvoice, getUserBusinessInfo } from './invoiceSendService';

function Invoices({ isDarkMode = false, estimates = [], jobs = [] }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [attachingInvoice, setAttachingInvoice] = useState(null);
  const [showJobSelector, setShowJobSelector] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState(''); // NEW: Search query state
  const [sendingInvoice, setSendingInvoice] = useState(null); // NEW: For send invoice modal
  const [userBusinessInfo, setUserBusinessInfo] = useState(null); // NEW: User business info for PDF
  const [showAddForm, setShowAddForm] = useState(false); // NEW: For showing new invoice form

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
        loadUserBusinessInfo(); // Load business info when user is authenticated
      } else {
        setLoading(false);
        clearInvoicesCache();
      }
    });
    return () => unsubscribe();
  }, []);

  // Load user business info for PDF generation
  const loadUserBusinessInfo = async () => {
    try {
      const info = await getUserBusinessInfo(auth.currentUser?.uid);
      setUserBusinessInfo(info);
    } catch (error) {
      console.error('Error loading user business info:', error);
    }
  };

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
    setShowAddForm(false); // Also close add form when canceling
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

  const handleUpdateInvoiceStatus = async (invoiceId, newStatus) => {
    try {
      // Find the invoice
      const invoice = invoices.find(inv => inv.id === invoiceId);
      
      if (!invoice) {
        console.error('Invoice not found');
        return;
      }
      
      // Update the invoice with the new status
      await updateInvoice(invoiceId, {
        ...invoice,
        status: newStatus
      });
      
      // Reload invoices to reflect the change
      clearInvoicesCache();
      loadInvoices();
      
    } catch (error) {
      console.error('Error updating invoice status:', error);
      alert('Failed to update invoice status. Please try again.');
    }
  };

  // Handler for viewing invoice (opens edit mode)
  const handleViewInvoice = (invoice) => {
    startEdit(invoice);
  };

  // Handler for sending invoice
  const handleSendInvoice = (invoice) => {
    setSendingInvoice(invoice);
  };

  // Handler for sending invoice via email
  const handleSendInvoiceEmail = async (email, message) => {
    try {
      await sendInvoiceViaEmail(sendingInvoice, email, message, userBusinessInfo);
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  // Handler for downloading invoice
  const handleDownloadInvoice = () => {
    if (sendingInvoice) {
      downloadInvoice(sendingInvoice, userBusinessInfo);
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
        {/* Header Stats - Matching Job Log StatusTabs Style */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '0.375rem',
          marginBottom: '1rem'
        }}>
          {/* All */}
          <button
            onClick={() => setStatusFilter('all')}
            style={{
              padding: '0.5rem 0.25rem',
              borderRadius: '0.5rem',
              border: `1px solid ${statusFilter === 'all' ? colors.text : colors.border}`,
              background: statusFilter === 'all' ? colors.text : 'transparent',
              color: statusFilter === 'all' ? colors.bg : colors.text,
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.375rem',
              transition: 'all 0.2s'
            }}
          >
            <span>All</span>
            <span style={{
              background: statusFilter === 'all' ? colors.bg : colors.cardBg,
              color: statusFilter === 'all' ? colors.text : colors.textSecondary,
              padding: '0.125rem 0.375rem',
              borderRadius: '1rem',
              fontSize: '0.7rem',
              fontWeight: '700',
              minWidth: '1.25rem',
              textAlign: 'center'
            }}>
              {invoices.length}
            </span>
          </button>

          {/* Paid */}
          <button
            onClick={() => setStatusFilter('Paid')}
            style={{
              padding: '0.5rem 0.25rem',
              borderRadius: '0.5rem',
              border: `1px solid ${statusFilter === 'Paid' ? '#10b981' : colors.border}`,
              background: statusFilter === 'Paid' ? '#10b98120' : 'transparent',
              color: statusFilter === 'Paid' ? '#10b981' : colors.text,
              fontSize: '0.7rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.125rem',
              transition: 'all 0.2s'
            }}
          >
            <span style={{
              background: statusFilter === 'Paid' ? '#10b981' : colors.cardBg,
              color: statusFilter === 'Paid' ? 'white' : colors.textSecondary,
              padding: '0.125rem 0.3rem',
              borderRadius: '1rem',
              fontSize: '0.65rem',
              fontWeight: '700',
              minWidth: '1.25rem',
              textAlign: 'center'
            }}>
              {invoices.filter(inv => inv.status === 'Paid').length}
            </span>
            <span style={{ fontSize: '0.65rem' }}>Paid</span>
          </button>

          {/* Pending */}
          <button
            onClick={() => setStatusFilter('Pending')}
            style={{
              padding: '0.5rem 0.25rem',
              borderRadius: '0.5rem',
              border: `1px solid ${statusFilter === 'Pending' ? '#f59e0b' : colors.border}`,
              background: statusFilter === 'Pending' ? '#f59e0b20' : 'transparent',
              color: statusFilter === 'Pending' ? '#f59e0b' : colors.text,
              fontSize: '0.7rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.125rem',
              transition: 'all 0.2s'
            }}
          >
            <span style={{
              background: statusFilter === 'Pending' ? '#f59e0b' : colors.cardBg,
              color: statusFilter === 'Pending' ? 'white' : colors.textSecondary,
              padding: '0.125rem 0.3rem',
              borderRadius: '1rem',
              fontSize: '0.65rem',
              fontWeight: '700',
              minWidth: '1.25rem',
              textAlign: 'center'
            }}>
              {invoices.filter(inv => inv.status === 'Pending').length}
            </span>
            <span style={{ fontSize: '0.65rem' }}>Pending</span>
          </button>

          {/* Overdue */}
          <button
            onClick={() => setStatusFilter('Overdue')}
            style={{
              padding: '0.5rem 0.25rem',
              borderRadius: '0.5rem',
              border: `1px solid ${statusFilter === 'Overdue' ? '#ef4444' : colors.border}`,
              background: statusFilter === 'Overdue' ? '#ef444420' : 'transparent',
              color: statusFilter === 'Overdue' ? '#ef4444' : colors.text,
              fontSize: '0.7rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.125rem',
              transition: 'all 0.2s'
            }}
          >
            <span style={{
              background: statusFilter === 'Overdue' ? '#ef4444' : colors.cardBg,
              color: statusFilter === 'Overdue' ? 'white' : colors.textSecondary,
              padding: '0.125rem 0.3rem',
              borderRadius: '1rem',
              fontSize: '0.65rem',
              fontWeight: '700',
              minWidth: '1.25rem',
              textAlign: 'center'
            }}>
              {invoices.filter(inv => inv.status === 'Overdue').length}
            </span>
            <span style={{ fontSize: '0.65rem' }}>Overdue</span>
          </button>

          {/* Canceled */}
          <button
            onClick={() => setStatusFilter('Canceled')}
            style={{
              padding: '0.5rem 0.25rem',
              borderRadius: '0.5rem',
              border: `1px solid ${statusFilter === 'Canceled' ? '#6b7280' : colors.border}`,
              background: statusFilter === 'Canceled' ? '#6b728020' : 'transparent',
              color: statusFilter === 'Canceled' ? '#6b7280' : colors.text,
              fontSize: '0.7rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.125rem',
              transition: 'all 0.2s'
            }}
          >
            <span style={{
              background: statusFilter === 'Canceled' ? '#6b7280' : colors.cardBg,
              color: statusFilter === 'Canceled' ? 'white' : colors.textSecondary,
              padding: '0.125rem 0.3rem',
              borderRadius: '1rem',
              fontSize: '0.65rem',
              fontWeight: '700',
              minWidth: '1.25rem',
              textAlign: 'center'
            }}>
              {invoices.filter(inv => inv.status === 'Canceled').length}
            </span>
            <span style={{ fontSize: '0.65rem' }}>Canceled</span>
          </button>
        </div>

        {/* Search Bar - NEW: Matching Job Log Style */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search 
              size={20}
              color={colors.textSecondary}
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none'
              }}
            />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 3rem',
                background: colors.cardBg,
                border: `1px solid ${colors.border}`,
                borderRadius: '0.5rem',
                color: colors.text,
                fontSize: '0.9375rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.border;
              }}
            />
          </div>
        </div>

        {/* New Invoice Button - Always visible */}
        <div 
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            background: colors.cardBg,
            border: `1px solid ${colors.border}`,
            borderRadius: '0.75rem',
            padding: '1rem',
            marginBottom: '1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem', color: colors.text }}>+</span>
            <span style={{ fontSize: '1rem', fontWeight: '600', color: colors.text }}>
              New Invoice
            </span>
          </div>
          <span style={{ color: colors.textSecondary, fontSize: '1.25rem' }}>
            {showAddForm ? '−' : '+'}
          </span>
        </div>

        {/* New Invoice Form - Shown when Add button clicked */}
        {showAddForm && !editingInvoice && (
          <div style={{ marginBottom: '1rem' }}>
            <InvoiceForm
              isDarkMode={isDarkMode}
              editingInvoice={null}
              onSave={saveInvoice}
              onCancel={() => setShowAddForm(false)}
              estimates={estimates}
              jobs={jobs}
              invoices={invoices}
              showToggle={false}
            />
          </div>
        )}

        {/* Edit Invoice Modal */}
        {editingInvoice && (
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
            padding: '1rem',
            paddingBottom: '6rem',
            overflowY: 'auto'
          }}>
            <div style={{
              background: colors.cardBg,
              borderRadius: '0.75rem',
              padding: '1.5rem',
              maxWidth: '600px',
              width: '100%',
              maxHeight: 'calc(100vh - 8rem)',
              overflow: 'auto',
              margin: 'auto'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <h3 style={{
                  margin: 0,
                  color: colors.text,
                  fontSize: '1.25rem',
                  fontWeight: '600'
                }}>
                  Edit Invoice
                </h3>
                <button
                  onClick={cancelEdit}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    color: colors.textSecondary
                  }}
                >
                  <X size={24} />
                </button>
              </div>
              
              <InvoiceForm
                isDarkMode={isDarkMode}
                editingInvoice={editingInvoice}
                onSave={saveInvoice}
                onCancel={cancelEdit}
                estimates={estimates}
                jobs={jobs}
                invoices={invoices}
              />
            </div>
          </div>
        )}

        {/* Section Header with Title and Count */}
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
            {statusFilter === 'all' ? 'All Invoices' : 
             statusFilter === 'Paid' ? 'Paid Invoices' :
             statusFilter === 'Pending' ? 'Pending Invoices' :
             statusFilter === 'Overdue' ? 'Overdue Invoices' :
             'Canceled Invoices'}
          </h3>
          <span style={{
            fontSize: '0.875rem',
            color: colors.textSecondary,
            background: colors.cardBg,
            padding: '0.25rem 0.75rem',
            borderRadius: '1rem',
            border: `1px solid ${colors.border}`
          }}>
            {(() => {
              // Filter by status
              const statusFiltered = statusFilter === 'all' 
                ? invoices 
                : invoices.filter(inv => inv.status === statusFilter);
              
              // Then filter by search query
              const filtered = statusFiltered.filter(inv => {
                if (!searchQuery) return true;
                const query = searchQuery.toLowerCase();
                return (
                  inv.invoiceNumber?.toLowerCase().includes(query) ||
                  inv.clientName?.toLowerCase().includes(query) ||
                  inv.client?.toLowerCase().includes(query) ||
                  inv.description?.toLowerCase().includes(query) ||
                  inv.status?.toLowerCase().includes(query)
                );
              });
              
              return `${filtered.length} ${filtered.length === 1 ? 'invoice' : 'invoices'}`;
            })()}
          </span>
        </div>

        {/* Invoices List with InvoiceCard components */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          {(() => {
            // Filter invoices based on selected status
            const statusFiltered = statusFilter === 'all' 
              ? invoices 
              : invoices.filter(inv => inv.status === statusFilter);

            // Then filter by search query
            const filteredInvoices = statusFiltered.filter(inv => {
              if (!searchQuery) return true;
              const query = searchQuery.toLowerCase();
              return (
                inv.invoiceNumber?.toLowerCase().includes(query) ||
                inv.clientName?.toLowerCase().includes(query) ||
                inv.client?.toLowerCase().includes(query) ||
                inv.description?.toLowerCase().includes(query) ||
                inv.status?.toLowerCase().includes(query)
              );
            });

            if (filteredInvoices.length === 0) {
              // Show different message if search is active
              if (searchQuery) {
                return (
                  <div style={{
                    background: colors.cardBg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '0.75rem',
                    padding: '3rem 1rem',
                    textAlign: 'center'
                  }}>
                    <Search 
                      size={48} 
                      color={colors.textSecondary} 
                      style={{ margin: '0 auto 1rem' }}
                    />
                    <p style={{
                      color: colors.textSecondary,
                      fontSize: '0.875rem',
                      margin: 0
                    }}>
                      No invoices found matching "{searchQuery}"
                    </p>
                  </div>
                );
              }

              const emptyMessages = {
                'all': 'No invoices yet. Create your first invoice!',
                'Paid': 'No paid invoices.',
                'Pending': 'No pending invoices.',
                'Overdue': 'No overdue invoices.',
                'Canceled': 'No canceled invoices.'
              };

              return (
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
                    {emptyMessages[statusFilter]}
                  </p>
                </div>
              );
            }

            return filteredInvoices.map(invoice => (
              <InvoiceCard
                key={invoice.id}
                invoice={invoice}
                onUpdateStatus={handleUpdateInvoiceStatus}
                onViewInvoice={handleViewInvoice}
                onDeleteInvoice={handleDeleteInvoice}
                onSendInvoice={handleSendInvoice}
                isDarkMode={isDarkMode}
                colors={colors}
              />
            ));
          })()}
        </div>
      </div>

      {/* Send Invoice Modal */}
      {sendingInvoice && (
        <SendInvoiceModal
          invoice={sendingInvoice}
          onClose={() => setSendingInvoice(null)}
          onSend={handleSendInvoiceEmail}
          isDarkMode={isDarkMode}
        />
      )}

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