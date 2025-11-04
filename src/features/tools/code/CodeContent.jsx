import React from 'react';
import { BookOpen, Zap, Home, Building, Globe, Cable, Shield, AlertTriangle, CheckSquare, Ruler, Plug, Lightbulb } from 'lucide-react';

const CodeContent = ({ colors, onSelectCode }) => {
  const codeCategories = [
    {
      name: 'Key Articles',
      color: '#3b82f6',
      items: [
        { 
          id: 'article-210', 
          name: 'Article 210', 
          description: 'Branch Circuits',
          icon: Cable
        },
        { 
          id: 'article-220', 
          name: 'Article 220', 
          description: 'Load Calculations',
          icon: Building
        },
        { 
          id: 'article-250', 
          name: 'Article 250', 
          description: 'Grounding & Bonding',
          icon: Globe
        },
        { 
          id: 'article-310', 
          name: 'Article 310', 
          description: 'Conductors',
          icon: Cable
        },
        { 
          id: 'article-314', 
          name: 'Article 314', 
          description: 'Boxes & Enclosures',
          icon: Shield
        },
        { 
          id: 'article-110', 
          name: 'Article 110', 
          description: 'General Requirements',
          icon: BookOpen
        }
      ]
    },
    {
      name: 'Common Requirements',
      color: '#8b5cf6',
      items: [
        { 
          id: 'gfci-requirements', 
          name: 'GFCI Requirements', 
          description: '210.8 Reference',
          icon: Zap
        },
        { 
          id: 'afci-requirements', 
          name: 'AFCI Requirements', 
          description: '210.12 Reference',
          icon: Shield
        },
        { 
          id: 'receptacle-spacing', 
          name: 'Receptacle Spacing', 
          description: '210.52 Reference',
          icon: Plug
        },
        { 
          id: 'working-space', 
          name: 'Working Space', 
          description: '110.26 Reference',
          icon: Ruler
        },
        { 
          id: 'lighting-loads', 
          name: 'Lighting Loads', 
          description: '220.12 Reference',
          icon: Lightbulb
        },
        { 
          id: 'grounding-sizing', 
          name: 'Grounding Sizing', 
          description: '250.66 & 250.122',
          icon: Globe
        }
      ]
    },
    {
      name: 'Installation Checklists',
      color: '#10b981',
      items: [
        { 
          id: 'residential-service', 
          name: 'Residential Service', 
          description: 'Installation Checklist',
          icon: Home
        },
        { 
          id: 'kitchen-circuits', 
          name: 'Kitchen Circuits', 
          description: 'Code Compliance',
          icon: CheckSquare
        },
        { 
          id: 'bathroom-circuits', 
          name: 'Bathroom Circuits', 
          description: 'Code Compliance',
          icon: CheckSquare
        },
        { 
          id: 'garage-circuits', 
          name: 'Garage Circuits', 
          description: 'Code Compliance',
          icon: CheckSquare
        }
      ]
    },
    {
      name: 'Safety Requirements',
      color: '#f59e0b',
      items: [
        { 
          id: 'arc-fault-protection', 
          name: 'Arc Fault Protection', 
          description: 'AFCI Applications',
          icon: AlertTriangle
        },
        { 
          id: 'ground-fault-protection', 
          name: 'Ground Fault Protection', 
          description: 'GFCI Applications',
          icon: AlertTriangle
        },
        { 
          id: 'overcurrent-protection', 
          name: 'Overcurrent Protection', 
          description: 'Breaker & Fuse Sizing',
          icon: Shield
        },
        { 
          id: 'equipment-grounding', 
          name: 'Equipment Grounding', 
          description: 'Grounding Requirements',
          icon: Globe
        }
      ]
    }
  ];

  const CodeCard = ({ item, categoryColor }) => {
    const Icon = item.icon;
    return (
      <button
        onClick={() => onSelectCode && onSelectCode(item.id)}
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
            {item.name}
          </span>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: '400',
            color: colors.subtext,
            lineHeight: '1.2'
          }}>
            {item.description}
          </span>
        </div>
      </button>
    );
  };

  return (
    <div>
      {codeCategories.map((category) => (
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

          {/* Code Items Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem'
          }}>
            {category.items.map(item => (
              <CodeCard 
                key={item.id} 
                item={item}
                categoryColor={category.color}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Disclaimer */}
      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: colors.cardBg,
        border: `1px solid ${colors.border}`,
        borderRadius: '0.75rem',
        fontSize: '0.8125rem',
        color: colors.subtext,
        textAlign: 'center'
      }}>
        <p style={{ margin: 0 }}>
          This tool provides quick NEC references and summaries. Always consult the official National Electrical Code® for complete requirements and your local jurisdiction for amendments.
        </p>
      </div>
    </div>
  );
};

export default CodeContent;