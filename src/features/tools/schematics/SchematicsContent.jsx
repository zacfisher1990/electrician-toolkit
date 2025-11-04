import React from 'react';
import { Lightbulb, Zap, Power, Settings, Clock, Sun, Trash2, Box, Network, Grid3x3, FileText, Home, Plug, Wind, UtensilsCrossed, Flame } from 'lucide-react';

const SchematicsContent = ({ colors, onSelectSchematic }) => {
  const schematicCategories = [
    {
      name: 'Common Wiring Diagrams',
      color: '#3b82f6',
      schematics: [
        { 
          id: 'three-way-switch', 
          name: '3-Way Switch', 
          description: 'Two Location Control',
          icon: Lightbulb
        },
        { 
          id: 'four-way-switch', 
          name: '4-Way Switch', 
          description: 'Three+ Location Control',
          icon: Lightbulb
        },
        { 
          id: 'split-receptacle', 
          name: 'Split Receptacle', 
          description: 'Half Hot Outlet',
          icon: Plug
        },
        { 
          id: 'gfci-circuit', 
          name: 'GFCI Circuit', 
          description: 'Protected Circuit',
          icon: Zap
        },
        { 
          id: 'afci-circuit', 
          name: 'AFCI Circuit', 
          description: 'Arc Fault Protection',
          icon: Zap
        },
        { 
          id: 'multi-wire-branch', 
          name: 'Multi-Wire Branch', 
          description: 'Shared Neutral',
          icon: Network
        },
        { 
          id: 'switched-outlet', 
          name: 'Switched Outlet', 
          description: 'Switch Controlled',
          icon: Power
        }
      ]
    },
    {
      name: 'Control Circuits',
      color: '#8b5cf6',
      schematics: [
        { 
          id: 'motor-control', 
          name: 'Motor Control', 
          description: 'Start/Stop Circuit',
          icon: Settings
        },
        { 
          id: 'lighting-contactor', 
          name: 'Lighting Contactor', 
          description: 'Relay Control',
          icon: Lightbulb
        },
        { 
          id: 'time-delay-relay', 
          name: 'Time Delay Relay', 
          description: 'Timer Circuit',
          icon: Clock
        },
        { 
          id: 'photocell-control', 
          name: 'Photocell Control', 
          description: 'Light Sensor',
          icon: Sun
        }
      ]
    },
    {
      name: 'Power Distribution',
      color: '#10b981',
      schematics: [
        { 
          id: 'single-line-diagram', 
          name: 'Single Line Diagram', 
          description: 'One-Line Drawing',
          icon: Network
        },
        { 
          id: 'panel-schedule', 
          name: 'Panel Schedule', 
          description: 'Load Directory',
          icon: Grid3x3
        },
        { 
          id: 'service-entrance', 
          name: 'Service Entrance', 
          description: 'Main Service',
          icon: Home
        },
        { 
          id: 'subpanel-connection', 
          name: 'Subpanel Connection', 
          description: 'Feeder Circuit',
          icon: Box
        }
      ]
    },
    {
      name: 'Common Installations',
      color: '#f59e0b',
      schematics: [
        { 
          id: 'ceiling-fan-light', 
          name: 'Ceiling Fan with Light', 
          description: 'Fan & Light Control',
          icon: Wind
        },
        { 
          id: 'garbage-disposal', 
          name: 'Garbage Disposal', 
          description: 'Switch & Outlet',
          icon: Trash2
        },
        { 
          id: 'dishwasher-circuit', 
          name: 'Dishwasher Circuit', 
          description: 'Dedicated Circuit',
          icon: UtensilsCrossed
        },
        { 
          id: 'range-oven', 
          name: 'Range/Oven', 
          description: '240V Connection',
          icon: Flame
        }
      ]
    }
  ];

  const SchematicCard = ({ schematic, categoryColor }) => {
    const Icon = schematic.icon;
    return (
      <button
        onClick={() => onSelectSchematic && onSelectSchematic(schematic.id)}
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
          e.currentTarget.style.borderColor = categoryColor;
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
          background: `${categoryColor}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={20} color={categoryColor} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
          <span style={{
            fontSize: '0.8125rem',
            fontWeight: '600',
            color: colors.text,
            lineHeight: '1.2'
          }}>
            {schematic.name}
          </span>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: '400',
            color: colors.subtext,
            lineHeight: '1.2'
          }}>
            {schematic.description}
          </span>
        </div>
      </button>
    );
  };

  return (
    <div>
      {schematicCategories.map((category) => (
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
              background: category.color,
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

          {/* Schematics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem'
          }}>
            {category.schematics.map(schematic => (
              <SchematicCard 
                key={schematic.id} 
                schematic={schematic}
                categoryColor={category.color}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SchematicsContent;