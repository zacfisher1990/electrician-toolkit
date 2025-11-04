import React from 'react';
import { Table, Zap, Box, Cable, Circle, Ruler, Globe } from 'lucide-react';

const TablesContent = ({ colors, onSelectTable }) => {
  const necTables = [
    {
      name: 'NEC Tables',
      tables: [
        { 
          id: 'table-310-16', 
          name: 'Table 310.16', 
          description: 'Ampacity',
          icon: Cable,
          color: '#3b82f6'
        },
        { 
          id: 'table-314-16', 
          name: 'Table 314.16', 
          description: 'Box Fill',
          icon: Box,
          color: '#8b5cf6'
        },
        { 
          id: 'table-314-28', 
          name: 'Table 314.28', 
          description: 'Pull Box',
          icon: Ruler,
          color: '#8b5cf6'
        },
        { 
          id: 'chapter-9', 
          name: 'Chapter 9', 
          description: 'Conduit Fill',
          icon: Circle,
          color: '#10b981'
        },
        { 
          id: 'table-250-66', 
          name: 'Table 250.66', 
          description: 'Grounding Electrode',
          icon: Globe,
          color: '#f59e0b'
        },
        { 
          id: 'table-250-122', 
          name: 'Table 250.122', 
          description: 'Equipment Grounding',
          icon: Globe,
          color: '#f59e0b'
        }
      ]
    }
  ];

  const TableCard = ({ table }) => {
    const Icon = table.icon;
    return (
      <button
        onClick={() => onSelectTable && onSelectTable(table.id)}
        style={{
          background: colors.cardBg,
          border: `1px solid ${colors.border}`,
          borderRadius: '0.75rem',
          padding: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          cursor: 'pointer',
          transition: 'all 0.2s',
          textAlign: 'center'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = table.color;
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = colors.border;
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
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