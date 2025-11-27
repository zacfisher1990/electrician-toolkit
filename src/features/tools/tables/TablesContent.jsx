import React, { useState } from 'react';
import { Cable, Grid, Box, Zap, Globe } from 'lucide-react';
import TableViewer from '../TableViewer';
import { table31016Data } from './table31016Data';
import { table31416BData } from './table31416BData';
import { table31416AData } from './table31416AData';

const TablesContent = ({ colors, isDarkMode }) => {
  const [selectedTable, setSelectedTable] = useState(null);

  const tables = [
    {
      id: 'table-310-16',
      title: 'Table 310.16',
      subtitle: 'Ampacity',
      icon: Cable,
      color: '#3b82f6',
      data: table31016Data
    },
    {
      id: 'table-314-16-a',
      title: 'Table 314.16(A)',
      subtitle: 'Metal Boxes',
      icon: Box,
      color: '#8b5cf6',
      data: table31416AData
    },
    {
      id: 'table-314-16-b',
      title: 'Table 314.16(B)',
      subtitle: 'Box Fill Volume',
      icon: Grid,
      color: '#a855f7',
      data: table31416BData
    },
    {
      id: 'table-314-28',
      title: 'Table 314.28',
      subtitle: 'Pull Box',
      icon: Grid,
      color: '#ec4899',
      data: null // To be implemented
    },
    {
      id: 'chapter-9',
      title: 'Chapter 9',
      subtitle: 'Conduit Fill',
      icon: Globe,
      color: '#06b6d4',
      data: null // To be implemented
    },
    {
      id: 'table-250-66',
      title: 'Table 250.66',
      subtitle: 'Grounding Electrode',
      icon: Zap,
      color: '#f59e0b',
      data: null // To be implemented
    },
    {
      id: 'table-250-122',
      title: 'Table 250.122',
      subtitle: 'Equipment Grounding',
      icon: Zap,
      color: '#f59e0b',
      data: null // To be implemented
    }
  ];

  // If a table is selected, show the TableViewer
  if (selectedTable) {
    return (
      <TableViewer
        tableData={selectedTable.data}
        isDarkMode={isDarkMode}
        onBack={() => setSelectedTable(null)}
      />
    );
  }

  // Otherwise show the table selection grid
  return (
    <div>
      <div style={{
        fontSize: '1rem',
        fontWeight: '600',
        color: colors.text,
        marginBottom: '1rem',
        paddingLeft: '0.5rem',
        borderLeft: `3px solid ${colors.primary}`,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        NEC Tables
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: '1rem'
      }}>
        {tables.map((table) => {
          const Icon = table.icon;
          const isAvailable = table.data !== null;

          return (
            <button
              key={table.id}
              onClick={() => {
                if (isAvailable) {
                  setSelectedTable(table);
                }
              }}
              disabled={!isAvailable}
              style={{
                background: colors.cardBg,
                border: `1px solid ${colors.border}`,
                borderRadius: '0.75rem',
                padding: '1.25rem 1rem',
                cursor: isAvailable ? 'pointer' : 'not-allowed',
                textAlign: 'center',
                transition: 'all 0.2s',
                opacity: isAvailable ? 1 : 0.5
              }}
              onMouseEnter={(e) => {
                if (isAvailable) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (isAvailable) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              <div style={{
                width: '3rem',
                height: '3rem',
                borderRadius: '0.75rem',
                background: `${table.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.75rem'
              }}>
                <Icon size={24} color={table.color} />
              </div>
              <div style={{
                fontSize: '0.9375rem',
                fontWeight: '600',
                color: colors.text,
                marginBottom: '0.25rem'
              }}>
                {table.title}
              </div>
              <div style={{
                fontSize: '0.8125rem',
                color: colors.subtext
              }}>
                {table.subtitle}
              </div>
              {!isAvailable && (
                <div style={{
                  fontSize: '0.75rem',
                  color: colors.subtext,
                  marginTop: '0.5rem',
                  fontStyle: 'italic'
                }}>
                  Coming Soon
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TablesContent;