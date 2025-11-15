import React, { useState, useEffect } from 'react';
import { Search, X, TrendingDown, Tally3, Target, Cable, SquareDivide, Omega, Plug, Package, Circle, Settings, BarChart3, Radio, Building, Lightbulb, Gauge, Triangle, Box, ArrowDown, ArrowUp, Ruler, Minus, TriangleRight, Palette } from 'lucide-react';
import { PiSolarPanel, PiChargingStation, PiPipe, PiComputerTower, PiShovel, PiNumberCircleThree, PiLineSegments } from 'react-icons/pi';
import { TbCircuitGround, TbCircuitMotor, TbCircuitInductor } from 'react-icons/tb';
import { FaCircleHalfStroke } from 'react-icons/fa6';
import { FiDivideCircle } from 'react-icons/fi';
import { GiClamp } from 'react-icons/gi';
import { getColors } from '../../../theme';
import styles from './Calculator.module.css';

function CalculatorMenu({ onSelectCalculator, isDarkMode, searchQuery }) {
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [recentlyUsed, setRecentlyUsed] = useState([]);

  // Use searchQuery from parent (Tools) if provided, otherwise use local state
  const searchTerm = searchQuery !== undefined ? searchQuery : localSearchTerm;

  const calculatorCategories = [
    {
      name: 'Installation',
      calculators: [
        { id: 'box-fill', name: 'Box Fill', icon: Package, keywords: 'box fill junction cubic inch volume 314' },
        { id: 'pull-box', name: 'Pull Box Sizing', icon: Box, keywords: 'pull box junction sizing straight angle u-pull 314.28 raceway conduit' },
        { id: 'conduit-fill', name: 'Conduit Fill', icon: FaCircleHalfStroke, keywords: 'conduit fill emt pvc rigid raceway chapter 9' },
        { id: 'conduit-bending', name: 'Conduit Bending', icon: PiPipe, keywords: 'conduit bending offset saddle stub bend emt' },
        { id: 'underground-depth', name: 'Underground Depth', icon: PiShovel, keywords: 'underground depth burial trench cable direct bury 300.5 nec pvc rmc duct install' },
        { id: 'overhead-clearance', name: 'Overhead Clearance', icon: ArrowUp, keywords: 'overhead clearance aerial height span service drop mast 225 attachment point roof' },
        { id: 'working-space', name: 'Working Space', icon: Ruler, keywords: 'working space clearance 110.26 condition panel switchboard equipment depth width height electrical room' },
        { id: 'support-spacing', name: 'Support Spacing', icon: GiClamp, keywords: 'support spacing straps clamps cable conduit hangers nm romex emt pvc mounting vertical horizontal 300.11 334.30' },
        { id: 'receptacles', name: 'Receptacle Spacing', icon: Plug, keywords: 'receptacle outlet gfci plug socket 210.52 counter kitchen bathroom wall spacing' },
        { id: 'lighting', name: 'Lighting', icon: Lightbulb, keywords: 'lighting lumens foot candles fixtures spacing watts illumination' },
        { id: 'phase-color', name: 'Phase Color', icon: Palette, keywords: 'phase color wire conductor identification circuit panel breaker black red blue brown orange yellow 120 208 277 480' }
      ]
    },
    {
      name: 'Power Calculations',
      calculators: [
        { id: 'voltage-drop', name: 'Voltage Drop', icon: TrendingDown, keywords: 'voltage drop vd wire circuit' },
        { id: 'ohms-law', name: "Ohm's Law", icon: FiDivideCircle, keywords: 'ohms law voltage current resistance power series parallel circuit' },
        { id: 'reactance-impedance', name: 'Reactance', icon: Omega, keywords: 'reactance impedance xl xc capacitive inductive resonance frequency ac circuit' },
        { id: 'power-factor', name: 'Power Factor', icon: Target, keywords: 'power factor correction pf capacitor kvar cos phi efficiency demand charge penalty savings' },
        { id: 'power-triangle', name: 'Power Triangle', icon: TriangleRight, keywords: 'power triangle kva kw kvar apparent real reactive power factor angle phase' },
        { id: 'three-phase-power', name: 'Three-Phase', icon: PiNumberCircleThree, keywords: 'three phase power 3 phase current voltage kw kva motor industrial commercial wye delta line' }
      ]
    },
    {
      name: 'Sizing & Rating',
      calculators: [
        { id: 'ampacity', name: 'Ampacity', icon: Cable, keywords: 'ampacity current rating 310 temperature' },
        { id: 'load-calculations', name: 'Load Calculations', icon: BarChart3, keywords: 'load calculation service size residential commercial demand' },
        { id: 'service-entrance', name: 'Service Entrance', icon: Building, keywords: 'service entrance sizing panel main 230' },
        { id: 'grounding-bonding', name: 'Grounding & Bonding', icon: TbCircuitGround, keywords: 'grounding bonding ground electrode equipment gec egc jumper 250' }
      ]
    },
    {
      name: 'Equipment',
      calculators: [
        { id: 'motor-calculations', name: 'Motors', icon: TbCircuitMotor, keywords: 'motor flc protection starter 430' },
        { id: 'transformer-sizing', name: 'Transformers', icon: TbCircuitInductor, keywords: 'transformer kva sizing current primary secondary 450' },
        { id: 'solar-pv', name: 'Solar PV', icon: PiSolarPanel, keywords: 'solar pv photovoltaic 690 panel array inverter string conductor ocpd renewable' },
        { id: 'ev-charging', name: 'EV Charging', icon: PiChargingStation, keywords: 'ev charging electric vehicle evse 625 charger station load continuous diversity feeder branch circuit nec' }
      ]
    }
  ];

  // Category colors for icon accents
  const categoryColors = {
    'Power Calculations': '#3b82f6',
    'Sizing & Rating': '#10b981',
    'Equipment': '#f59e0b',
    'Installation': '#dc2626'
  };

  // Get colors from centralized theme
  const colors = getColors(isDarkMode);

  // Flatten all calculators for searching
  const allCalculators = calculatorCategories.flatMap(category => 
    category.calculators.map(calc => ({ ...calc, category: category.name }))
  );

  // Load recently used calculators from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('recentCalculators');
    if (stored) {
      try {
        const storedIds = JSON.parse(stored);
        const calculators = storedIds
          .map(id => allCalculators.find(c => c.id === id))
          .filter(Boolean);
        setRecentlyUsed(calculators);
      } catch (e) {
        console.error('Error loading recent calculators:', e);
      }
    }
  }, []);

  // Handle calculator selection
  const handleCalculatorClick = (id) => {
    // Update recently used
    const newRecent = [id, ...recentlyUsed.map(c => c.id).filter(cid => cid !== id)].slice(0, 3);
    localStorage.setItem('recentCalculators', JSON.stringify(newRecent));
    
    // Navigate to calculator
    if (onSelectCalculator) {
      onSelectCalculator(id);
    }
  };

  // Filter calculators based on search
  const filteredCategories = searchTerm
    ? calculatorCategories.map(category => ({
        ...category,
        calculators: category.calculators.filter(calc =>
          calc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          calc.keywords.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(category => category.calculators.length > 0)
    : calculatorCategories;

  // Calculator Card Component
  const CalculatorCard = ({ calc, categoryColor }) => {
  const Icon = calc.icon;
  
  return (
    <button
      onClick={() => handleCalculatorClick(calc.id)}
      className={styles.calculatorCard}
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
          {calc.name}
        </span>
      </div>
    </button>
  );
};

  return (
    <div>
      {/* Recently Used Section */}
      {!searchTerm && recentlyUsed.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          {/* Section Header - Matching Jobs "All Jobs" style */}
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
              Recently Used
            </h3>
          </div>

          {/* Recently Used Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem'
          }}>
            {recentlyUsed.map(calc => (
              <CalculatorCard 
                key={calc.id} 
                calc={calc} 
                categoryColor={categoryColors[calc.category] || '#6b7280'} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Calculator Categories */}
      {filteredCategories.map((category, index) => (
        <div key={category.name} style={{ marginBottom: '1.5rem' }}>
          {/* Category Header - Matching Jobs style */}
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
              background: categoryColors[category.name] || '#6b7280',
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

          {/* Calculator Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem'
          }}>
            {category.calculators.map(calc => (
              <CalculatorCard 
                key={calc.id} 
                calc={calc} 
                categoryColor={categoryColors[category.name] || '#6b7280'} 
              />
            ))}
          </div>
        </div>
      ))}

      {/* No Results */}
      {searchTerm && filteredCategories.length === 0 && (
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
            No calculators match your search.
          </p>
        </div>
      )}
    </div>
  );
}

export default CalculatorMenu;