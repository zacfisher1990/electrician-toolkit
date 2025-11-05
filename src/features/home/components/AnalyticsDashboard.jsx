import React from 'react';
import { DollarSign, Briefcase, FileText, Receipt, Clock, TrendingUp, Calendar } from 'lucide-react';
import styles from '../Home.module.css';

const AnalyticsDashboard = ({ analytics, colors, isDarkMode }) => {
  const StatCard = ({ icon: Icon, label, value, subValue, color, bgColor }) => (
    <div
      style={{
        background: colors.cardBg,
        border: `1px solid ${colors.border}`,
        borderRadius: '0.75rem',
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}
    >
      <div
        style={{
          background: bgColor || `${color}20`,
          borderRadius: '0.5rem',
          padding: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Icon size={24} style={{ color }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: '0.75rem',
          color: colors.subtext,
          marginBottom: '0.25rem',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          {label}
        </div>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: colors.text,
          lineHeight: 1
        }}>
          {value}
        </div>
        {subValue && (
          <div style={{
            fontSize: '0.75rem',
            color: colors.subtext,
            marginTop: '0.25rem'
          }}>
            {subValue}
          </div>
        )}
      </div>
    </div>
  );

  const RevenueCard = ({ title, amount, icon: Icon, period }) => (
    <div
      style={{
        background: colors.cardBg,
        border: `1px solid ${colors.border}`,
        borderRadius: '0.75rem',
        padding: '1rem'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.5rem'
      }}>
        <div style={{
          fontSize: '0.75rem',
          color: colors.subtext,
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          {title}
        </div>
        {Icon && <Icon size={16} style={{ color: colors.subtext }} />}
      </div>
      <div style={{
        fontSize: '1.75rem',
        fontWeight: '700',
        color: '#10b981',
        marginBottom: '0.25rem'
      }}>
        ${amount.toLocaleString()}
      </div>
      {period && (
        <div style={{
          fontSize: '0.7rem',
          color: colors.subtext
        }}>
          {period}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ marginBottom: '1rem' }}>
      {/* Analytics Title */}
      <h2 style={{
        margin: '0 0 1rem 0',
        fontSize: '1.25rem',
        fontWeight: '700',
        color: colors.text,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <TrendingUp size={24} style={{ color: '#10b981' }} />
        Analytics
      </h2>

      {/* Revenue Section */}
      <div
        style={{
          background: colors.cardBg,
          border: `1px solid ${colors.border}`,
          borderRadius: '0.75rem',
          padding: '1rem',
          marginBottom: '1rem'
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1rem'
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '1rem',
            fontWeight: '700',
            color: colors.text
          }}>
            Revenue Analytics
          </h3>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem'
        }}>
          <RevenueCard
            title="All Time"
            amount={analytics.revenue.allTime}
            period="Total earnings"
          />
          <RevenueCard
            title="This Year"
            amount={analytics.revenue.year}
            icon={Calendar}
            period={new Date().getFullYear().toString()}
          />
          <RevenueCard
            title="This Month"
            amount={analytics.revenue.month}
            period={new Date().toLocaleDateString('en-US', { month: 'long' })}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '1rem'
      }}>
        {/* Jobs */}
        <StatCard
          icon={Briefcase}
          label="Total Jobs"
          value={analytics.jobs.total}
          subValue={`${analytics.jobs.completed} completed`}
          color="#3b82f6"
        />

        {/* Estimates */}
        <StatCard
          icon={FileText}
          label="Estimates"
          value={analytics.estimates.total}
          subValue={`${analytics.estimates.accepted} accepted`}
          color="#8b5cf6"
        />

        {/* Invoices */}
        <StatCard
          icon={Receipt}
          label="Invoices"
          value={analytics.invoices.total}
          subValue={`${analytics.invoices.paid} paid`}
          color="#10b981"
        />

        {/* Clocked Hours */}
        <StatCard
          icon={Clock}
          label="Clocked Hours"
          value={analytics.hours.formatted}
          subValue={`${Math.round(analytics.hours.totalHours)} total hours`}
          color="#f59e0b"
        />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;