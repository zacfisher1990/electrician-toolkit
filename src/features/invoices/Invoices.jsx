import React, { useState } from 'react';
import { FileText, Plus, Search, Filter } from 'lucide-react';

function Invoices({ isDarkMode = false }) {
  const [invoices, setInvoices] = useState([
    {
      id: 1,
      invoiceNumber: 'INV-001',
      client: 'ABC Construction',
      date: '2025-10-01',
      amount: 2500.00,
      status: 'Paid'
    },
    {
      id: 2,
      invoiceNumber: 'INV-002',
      client: 'Smith Residence',
      date: '2025-10-10',
      amount: 1200.00,
      status: 'Pending'
    },
    {
      id: 3,
      invoiceNumber: 'INV-003',
      client: 'Downtown Office Building',
      date: '2025-10-12',
      amount: 4800.00,
      status: 'Overdue'
    }
  ]);

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

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.bg,
      paddingTop: '1rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1rem'
      }}>
        {/* Header Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            background: colors.cardBg,
            border: `1px solid ${colors.border}`,
            borderRadius: '0.5rem',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '0.875rem',
              color: colors.textSecondary,
              marginBottom: '0.25rem'
            }}>
              Total
            </div>
            <div style={{
              fontSize: '1.5rem',
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
            padding: '1rem',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '0.875rem',
              color: colors.textSecondary,
              marginBottom: '0.25rem'
            }}>
              Paid
            </div>
            <div style={{
              fontSize: '1.5rem',
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
            padding: '1rem',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '0.875rem',
              color: colors.textSecondary,
              marginBottom: '0.25rem'
            }}>
              Pending
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: colors.pendingText
            }}>
              {invoices.filter(inv => inv.status === 'Pending').length}
            </div>
          </div>
        </div>

        {/* Add New Invoice Button */}
        <button
          style={{
            width: '100%',
            background: colors.buttonBg,
            color: colors.buttonText,
            border: 'none',
            borderRadius: '0.5rem',
            padding: '0.875rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem'
          }}
        >
          <Plus size={20} />
          <span>Create New Invoice</span>
        </button>

        {/* Invoices List */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {invoices.length === 0 ? (
            <div style={{
              background: colors.cardBg,
              border: `1px solid ${colors.border}`,
              borderRadius: '0.5rem',
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
                style={{
                  background: colors.cardBg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '0.5rem',
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
    </div>
  );
}

export default Invoices;