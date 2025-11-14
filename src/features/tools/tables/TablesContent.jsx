import React, { useState } from 'react';
import { Table, Zap, Box, Cable, Circle, Ruler, Globe } from 'lucide-react';
import Table310_16 from './Table310_16';
import Table314_16 from './Table314_16';
import Table314_28 from './Table314_28';
import Chapter9 from './Chapter9';
import Table250_66 from './Table250_66';
import Table250_122 from './Table250_122';

const TablesContent = ({ colors, isDarkMode }) => {
  const [activeTable, setActiveTable] = useState(null);

  const necTables = [
    {
      name: 'NEC Tables',
      tables: [
        { 
          id: 'table-310-16', 
          name: 'Table 310.16', 
          description: 'Ampacity',
          icon: Cable,
          color: '#3b82f6',
          component: Table310_16
        },
        { 
          id: 'table-314-16', 
          name: 'Table 314.16', 
          description: 'Box Fill',
          icon: Box,
          color: '#8b5cf6',
          component: Table314_16
        },
        { 
          id: 'table-314-28', 
          name: 'Table 314.28', 
          description: 'Pull Box',
          icon: Ruler,
          color: '#8b5cf6',
          component: Table314_28
        },
        { 
          id: 'chapter-9', 
          name: 'Chapter 9', 
          description: 'Conduit Fill',
          icon: Circle,
          color: '#10b981',
          component: Chapter9
        },
        { 
          id: 'table-250-66', 
          name: 'Table 250.66', 
          description: 'Grounding Electrode',
          icon: Globe,
          color: '#f59e0b',
          component: Table250_66
        },
        { 
          id: 'table-250-122', 
          name: 'Table 250.122', 
          description: 'Equipment Grounding',
          icon: Globe,
          color: '#f59e0b',
          component: Table250_122
        }
      ]
    }
  ];

  // If a table is selected, render its component
  if (activeTable) {
    const table = necTables[0].tables.find(t => t.id === activeTable);
    if (table && table.component) {
      const TableComponent = table.component;
      return (
        <TableComponent 
          isDarkMode={isDarkMode} 
          onBack={() => setActiveTable(null)}
        />
      );
    }
  }

  const TableCard = ({ table }) => {
    const Icon = table.icon;
    const isAvailable = table.component !== null;
    
    return (
      <button
        onClick={() => isAvailable && setActiveTable(table.id)}
        disabled={!isAvailable}
        style={{
          background: colors.cardBg,
          border: `1px solid ${colors.border}`,
          borderRadius: '0.75rem',
          padding: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          cursor: isAvailable ? 'pointer' : 'not-allowed',
          transition: 'all 0.2s',
          textAlign: 'center',
          opacity: isAvailable ? 1 : 0.5,
          position: 'relative'
        }}
        onMouseEnter={(e) => {
          if (isAvailable) {
            e.currentTarget.style.borderColor = table.color;
            e.currentTarget.style.transform = 'translateY(-2px)';
          }
        }}
        onMouseLeave={(e) => {
          if (isAvailable) {
            e.currentTarget.style.borderColor = colors.border;
            e.currentTarget.style.transform = 'translateY(0)';
          }
        }}
      >
        {!isAvailable && (
          <div style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            background: colors.subtext,
            color: colors.cardBg,
            fontSize: '0.625rem',
            padding: '0.125rem 0.375rem',
            borderRadius: '0.25rem',
            fontWeight: '600'
          }}>
            Soon
          </div>
        )}
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '0.75rem',
          background: `${table.color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={20} color={table.color} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
          <span style={{
            fontSize: '0.8125rem',
            fontWeight: '600',
            color: colors.text,
            lineHeight: '1.2'
          }}>
            {table.name}
          </span>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: '400',
            color: colors.subtext,
            lineHeight: '1.2'
          }}>
            {table.description}
          </span>
        </div>
      </button>
    );
  };

  // Default table grid view
  return (
    <div>
      {necTables.map((category, index) => (
        <div key={category.name} style={{ marginBottom: '1.5rem' }}>
          {/* Category Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.75rem',
            paddingLeft: '0.25rem'
          }}>
            <div style={{
              width: '3px',
              height: '1.25rem',
              background: '#8b5cf6',
              borderRadius: '2px'
            }} />
            <h3 style={{ 
              margin: 0, 
              color: colors.text,
              fontSize: '1rem',
              fontWeight: '600'
            }}>
              {category.name}
            </h3>
          </div>

          {/* Tables Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem'
          }}>
            {category.tables.map(table => (
              <TableCard key={table.id} table={table} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TablesContent;