import React, { useState } from 'react';
import { ChevronLeft, Download, Share2 } from 'lucide-react';
import { getColors } from '../../theme';

const TableViewer = ({ tableData, isDarkMode = false, onBack }) => {
  const colors = getColors(isDarkMode);
  const primaryBlue = '#2563eb';

  const renderTableCell = (cell, isHeader = false) => {
    const baseStyle = {
      padding: '0.5rem',
      border: `1px solid ${colors.border}`,
      textAlign: cell.align || 'left',
      fontSize: isHeader ? '0.8125rem' : '0.875rem',
      fontWeight: isHeader ? '600' : '400',
      background: isHeader ? colors.cardBg : colors.inputBg,
      color: colors.text,
      verticalAlign: 'top',
      lineHeight: '1.4'
    };

    if (cell.colspan) {
      return (
        <td 
          key={cell.id || Math.random()} 
          colSpan={cell.colspan} 
          style={{
            ...baseStyle,
            textAlign: cell.align || 'center',
            fontWeight: cell.bold ? '600' : baseStyle.fontWeight
          }}
        >
          {cell.content}
        </td>
      );
    }

    if (cell.rowspan) {
      return (
        <td 
          key={cell.id || Math.random()} 
          rowSpan={cell.rowspan} 
          style={{
            ...baseStyle,
            fontWeight: cell.bold ? '600' : baseStyle.fontWeight
          }}
        >
          {cell.content}
        </td>
      );
    }

    return (
      <td 
        key={cell.id || Math.random()} 
        style={{
          ...baseStyle,
          fontWeight: cell.bold ? '600' : baseStyle.fontWeight
        }}
      >
        {cell.content}
      </td>
    );
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: colors.mainBg,
      paddingBottom: '5rem'
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        background: primaryBlue,
        color: 'white',
        padding: '1rem',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            marginLeft: '-0.5rem'
          }}
        >
          <ChevronLeft size={24} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: '1.125rem',
            fontWeight: '600',
            color: 'white'
          }}>
            {tableData.title}
          </h1>
          {tableData.subtitle && (
            <p style={{ 
              margin: '0.25rem 0 0 0',
              fontSize: '0.8125rem',
              opacity: 0.9,
              color: 'white'
            }}>
              {tableData.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Table Description */}
      {tableData.description && (
        <div style={{
          padding: '1rem',
          background: colors.cardBg,
          borderBottom: `1px solid ${colors.border}`,
          fontSize: '0.875rem',
          color: colors.text,
          lineHeight: '1.5'
        }}>
          {tableData.description}
        </div>
      )}

      {/* Table Container */}
      <div style={{ 
        padding: '1rem',
        overflowX: 'auto'
      }}>
        <div style={{
          background: colors.cardBg,
          borderRadius: '0.5rem',
          border: `1px solid ${colors.border}`,
          overflow: 'hidden'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.875rem'
          }}>
            {/* Table Headers */}
            {tableData.headers && (
              <thead>
                {tableData.headers.map((headerRow, rowIndex) => (
                  <tr key={`header-${rowIndex}`}>
                    {headerRow.map((cell, cellIndex) => 
                      renderTableCell(cell, true)
                    )}
                  </tr>
                ))}
              </thead>
            )}

            {/* Table Body */}
            <tbody>
              {tableData.rows.map((row, rowIndex) => (
                <tr 
                  key={`row-${rowIndex}`}
                  style={{
                    background: rowIndex % 2 === 0 ? colors.inputBg : colors.cardBg
                  }}
                >
                  {row.map((cell, cellIndex) => 
                    renderTableCell(cell, false)
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Notes */}
        {tableData.notes && tableData.notes.length > 0 && (
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            background: colors.cardBg,
            borderRadius: '0.5rem',
            border: `1px solid ${colors.border}`,
            fontSize: '0.8125rem',
            color: colors.subtext,
            lineHeight: '1.6'
          }}>
            {tableData.notes.map((note, index) => (
              <div key={index} style={{ marginBottom: index < tableData.notes.length - 1 ? '0.5rem' : 0 }}>
                {note}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TableViewer;