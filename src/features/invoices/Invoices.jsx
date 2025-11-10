import React, { useState, useEffect } from 'react';
import { FileText, Search, X } from 'lucide-react';
import { PiInvoice } from 'react-icons/pi';
import { getColors } from '../../theme';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import { getUserInvoices, createInvoice, updateInvoice, deleteInvoice, recordInvoiceSent } from './invoicesService';
import { saveInvoices, getInvoices, clearInvoicesCache } from '../../utils/localStorageUtils';
import InvoiceModal from './InvoiceModal';
import AddInvoiceSection from './AddInvoiceSection';
import InvoiceCard from './InvoiceCard';
import SendInvoiceModal from './SendInvoiceModal';
import InvoiceStatusTabs from './InvoiceStatusTabs';
import { sendInvoiceViaEmail, downloadInvoice, getUserBusinessInfo } from './invoiceSendService';
import AuthModal from '../profile/AuthModal';
import VerificationRequiredModal from '../../components/VerificationRequiredModal';

function Invoices({ isDarkMode = false, estimates = [], jobs = [], isEmailVerified, onResendVerification }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sendingInvoice, setSendingInvoice] = useState(null);
  const [userBusinessInfo, setUserBusinessInfo] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // Get colors from centralized theme
  const colors = {
    ...getColors(isDarkMode),
    // Invoice-specific status colors
    paidBg: isDarkMode ? '#064e3b' : '#d1fae5',
    paidText: isDarkMode ? '#6ee7b7' : '#065f46',
    pendingBg: isDarkMode ? '#78350f' : '#fef3c7',
    pendingText: isDarkMode ? '#fcd34d' : '#92400e',
    unsentBg: isDarkMode ? '#374151' : '#f3f4f6',
    unsentText: isDarkMode ? '#9ca3af' : '#6b7280',
    overdueBg: isDarkMode ? '#7f1d1d' : '#fee2e2',
    overdueText: isDarkMode ? '#fca5a5' : '#991b1b',
    buttonBg: '#3b82f6',
    buttonText: '#ffffff'
  };

  // Load invoices from Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadInvoices();
        loadUserBusinessInfo();
        setIsUserLoggedIn(true);
      } else {
        setLoading(false);
        clearInvoicesCache();
        setIsUserLoggedIn(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Load user business info for PDF generation
  const loadUserBusinessInfo = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log('No user logged in');
        return;
      }
      
      console.log('Loading business info for user:', user.uid);
      const info = await getUserBusinessInfo(user.uid);
      console.log('Loaded business info:', info);
      setUserBusinessInfo(info);
    } catch (error) {
      console.error('Error loading user business info:', error);
    }
  };

  const loadInvoices = async () => {
    try {
      const cachedInvoices = getInvoices();
      if (cachedInvoices) {
        setInvoices(cachedInvoices);
        setLoading(false);
      }

      const userInvoices = await getUserInvoices();
      setInvoices(userInvoices);
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
      setShowAddForm(false);
      clearInvoicesCache();
      loadInvoices();
    } catch (error) {
      console.error('Error saving invoice:', error);
      alert('Failed to save invoice. Please try again.');
    }
  };

  const startEdit = (invoice) => {
    setEditingInvoice(invoice);
  };

  const cancelEdit = () => {
    setEditingInvoice(null);
    setShowAddForm(false);
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
      const invoice = invoices.find(inv => inv.id === invoiceId);
      
      if (!invoice) {
        console.error('Invoice not found');
        return;
      }
      
      await updateInvoice(invoiceId, {
        ...invoice,
        status: newStatus
      });
      
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
      
      // Record that the invoice was sent
      await recordInvoiceSent(sendingInvoice.id, email);
      
      // Automatically update status to "Pending" after successful email send
      if (sendingInvoice.status === 'Draft' || !sendingInvoice.status) {
        await updateInvoice(sendingInvoice.id, {
          ...sendingInvoice,
          status: 'Pending'
        });
        
        clearInvoicesCache();
        loadInvoices();
      }
      
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  // Handler for downloading invoice
  const handleDownloadInvoice = async () => {
    try {
      if (!sendingInvoice) {
        throw new Error('No invoice selected');
      }

      let businessInfo = userBusinessInfo;
      if (!businessInfo) {
        console.log('User business info not loaded, loading now...');
        businessInfo = await getUserBusinessInfo(auth.currentUser?.uid);
        setUserBusinessInfo(businessInfo);
      }

      console.log('Downloading invoice with:', { sendingInvoice, businessInfo });
      downloadInvoice(sendingInvoice, businessInfo);
      
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert(`Failed to download invoice: ${error.message}`);
    }
  };

  // Handle add invoice click
  const handleAddInvoiceClick = () => {
    if (!isUserLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    
    if (!isEmailVerified) {
      setShowVerificationModal(true);
      return;
    }
    
    setShowAddForm(true);
    setEditingInvoice(null);
  };

  // Calculate status counts
  const statusCounts = {
    all: invoices.length,
    Draft: invoices.filter(inv => inv.status === 'Draft' || !inv.status).length,
    Pending: invoices.filter(inv => inv.status === 'Pending').length,
    Paid: invoices.filter(inv => inv.status === 'Paid').length
  };

  // Filter invoices based on selected status
  const statusFiltered = statusFilter === 'all' 
    ? invoices 
    : invoices.filter(inv => {
        if (statusFilter === 'Draft') {
          return inv.status === 'Draft' || !inv.status;
        }
        return inv.status === statusFilter;
      });

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

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: colors.mainBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: '5rem'
      }}>
        <div style={{ color: colors.subtext }}>Loading invoices...</div>
      </div>
    );
  }

  return (
    <div className="invoices-container">
      {/* Verification Modal */}
      <VerificationRequiredModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        isDarkMode={isDarkMode}
        featureName="create new invoices"
        onResendVerification={onResendVerification}
      />

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Add Invoice Modal */}
      {showAddForm && !editingInvoice && (
        <InvoiceModal
          editingInvoice={null}
          onSave={saveInvoice}
          onCancel={() => setShowAddForm(false)}
          onDelete={null}
          isDarkMode={isDarkMode}
          colors={colors}
          isNewInvoice={true}
          estimates={estimates}
          jobs={jobs}
        />
      )}

      {/* Edit Invoice Modal */}
      {editingInvoice && !showAddForm && !sendingInvoice && (
        <InvoiceModal
          editingInvoice={editingInvoice}
          onSave={saveInvoice}
          onCancel={cancelEdit}
          onDelete={handleDeleteInvoice}
          isDarkMode={isDarkMode}
          colors={colors}
          isNewInvoice={false}
          estimates={estimates}
          jobs={jobs}
        />
      )}

      {/* Send Invoice Modal */}
      {sendingInvoice && (
        <SendInvoiceModal
          invoice={sendingInvoice}
          isDarkMode={isDarkMode}
          onClose={() => setSendingInvoice(null)}
          onSend={handleSendInvoiceEmail}
          onDownload={handleDownloadInvoice}
        />
      )}

      <div style={{ 
        minHeight: '100vh', 
        background: colors.mainBg,
        paddingBottom: '5rem'
      }}>
        <div style={{ padding: '1rem 0.25rem' }}>
          {/* Status Tabs */}
          <InvoiceStatusTabs
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            statusCounts={statusCounts}
            colors={colors}
          />

          {/* Search Bar */}
          <div style={{ marginBottom: '1rem', position: 'relative' }}>
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                paddingLeft: '2.5rem',
                paddingRight: searchQuery ? '2.5rem' : '0.75rem',
                border: `1px solid ${colors.border}`,
                borderRadius: '0.5rem',
                fontSize: '0.9375rem',
                background: colors.inputBg,
                color: colors.text,
                boxSizing: 'border-box'
              }}
            />
            <Search 
              size={18} 
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: colors.subtext,
                pointerEvents: 'none'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: colors.subtext,
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={18} />
              </button>
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
              {searchQuery ? 'Search Results' : 'All Invoices'}
            </h3>
            <span style={{
              fontSize: '0.875rem',
              color: colors.subtext,
              background: colors.cardBg,
              padding: '0.25rem 0.75rem',
              borderRadius: '1rem',
              border: `1px solid ${colors.border}`
            }}>
              {filteredInvoices.length} {filteredInvoices.length === 1 ? 'invoice' : 'invoices'}
            </span>
          </div>

          {/* Add Invoice Button */}
          <AddInvoiceSection
            handleAddInvoiceClick={handleAddInvoiceClick}
            isDarkMode={isDarkMode}
            colors={colors}
          />

          {/* No Results Message */}
          {searchQuery && filteredInvoices.length === 0 && (
            <div style={{
              background: colors.cardBg,
              border: `1px solid ${colors.border}`,
              borderRadius: '0.75rem',
              textAlign: 'center',
              padding: '3rem 1rem',
              color: colors.subtext
            }}>
              <Search size={48} color={colors.subtext} style={{ margin: '0 auto 1rem' }} />
              <p style={{ margin: 0, fontSize: '0.9375rem' }}>
                No invoices match your search.
              </p>
            </div>
          )}

          {/* Empty State */}
          {!searchQuery && invoices.length === 0 && (
            <div style={{
              background: colors.cardBg,
              border: `1px solid ${colors.border}`,
              borderRadius: '0.75rem',
              textAlign: 'center',
              padding: '3rem 1rem',
              color: colors.subtext
            }}>
              <PiInvoice size={48} color={colors.subtext} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: '0.9375rem' }}>No invoices yet. Create your first invoice above!</p>
            </div>
          )}

          {/* Invoices List */}
          {filteredInvoices.length > 0 && filteredInvoices.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              isDarkMode={isDarkMode}
              colors={colors}
              onEdit={handleViewInvoice}
              onDelete={handleDeleteInvoice}
              onSend={handleSendInvoice}
              onUpdateStatus={handleUpdateInvoiceStatus}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Invoices;