import React, { useState, useRef } from 'react';
import { Menu, FileDown, Zap, Plug, Package, Wrench, AlertTriangle, Settings, BarChart3, Cpu, Building, Shield, Maximize2, Lightbulb, Gauge, Waves, Activity, Calculator, User, Briefcase, Triangle, Home as HomeIcon, FileText } from 'lucide-react';
import CalculatorMenu from './CalculatorMenu.jsx';
import VoltageDropCalculator from './VoltageDropCalculator.jsx';
import OhmsLawCalculator from './OhmsLawCalculator.jsx';
import BoxFillCalculator from './BoxFillCalculator.jsx';
import ConduitFillCalculator from './ConduitFillCalculator.jsx';
import AmpacityLookupCalculator from './AmpacityLookupCalculator.jsx';
import MotorCalculations from './MotorCalculations.jsx';
import LoadCalculations from './LoadCalculations.jsx';
import TransformerSizingCalculator from './TransformerSizingCalculator.jsx';
import ServiceEntranceSizing from './ServiceEntranceSizing.jsx';
import GroundingBondingCalculator from './GroundingBondingCalculator.jsx';
import ConduitBendingCalculator from './ConduitBendingCalculator.jsx';
import LightingCalculator from './LightingCalculator.jsx';
import BottomNavigation from './BottomNavigation.jsx';
import VFDSizingCalculator from './VFDSizingCalculator.jsx';
import ReactanceImpedanceCalculator from './ReactanceImpedanceCalculator.jsx';
import PowerFactorCorrection from './PowerFactorCorrection.jsx';
import PowerTriangleCalculator from './PowerTriangleCalculator.jsx';
import ThreePhasePowerCalculator from './ThreePhasePowerCalculator.jsx';
import Home from './Home.jsx';
import Profile from './Profile.jsx';
import Jobs from './Jobs.jsx';
import Estimates from './Estimates.jsx';
import './App.css';

function App() {
  const [activeCalculator, setActiveCalculator] = useState(() => {
    // Initialize from localStorage or default to null (home)
    const saved = localStorage.getItem('activeView');
    return saved || null;
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
  // Initialize from localStorage or default to false
  const saved = localStorage.getItem('isDarkMode');
  return saved === 'true'; // localStorage stores strings, so convert to boolean
});
  const [showMenu, setShowMenu] = useState(false);
  const [showExportToast, setShowExportToast] = useState(false);
  const [pendingEstimate, setPendingEstimate] = useState(null);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  // SHARED JOBS STATE - moved from Jobs.jsx
  const [jobs, setJobs] = useState([]);
  
  // Save active view to localStorage whenever it changes
  React.useEffect(() => {
    if (activeCalculator === null) {
      localStorage.setItem('activeView', '');
    } else {
      localStorage.setItem('activeView', activeCalculator);
    }
  }, [activeCalculator]);

  // Save dark mode preference to localStorage whenever it changes
  React.useEffect(() => {
    localStorage.setItem('isDarkMode', isDarkMode);
    }, [isDarkMode]);

   
  // Update theme-color meta tag based on dark mode
  React.useEffect(() => {
     const updateThemeColor = () => {
     const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
       metaThemeColor.setAttribute('content', isDarkMode ? '#000000' : '#2563eb');
      }
    };

     // Update immediately
    updateThemeColor();

     // Also update when page becomes visible (when returning to the app)
     const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          updateThemeColor();
        }
     };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, [isDarkMode]);

  React.useEffect(() => {
  // Scroll to top whenever the view changes
    window.scrollTo(0, 0);
    }, [activeCalculator]);
  
  // Job management functions
  const addJob = (jobData) => {
    setJobs([...jobs, { ...jobData, id: Date.now() }]);
  };
  
  const updateJob = (jobId, jobData) => {
    setJobs(jobs.map(job => 
      job.id === jobId ? { ...jobData, id: job.id } : job
    ));
  };
  
  const deleteJob = (jobId) => {
    setJobs(jobs.filter(job => job.id !== jobId));
  };
  
  // Ref to access calculator's export function
  const calculatorRef = useRef(null);

  // Handle scroll to show/hide header
  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 10) {
        // Always show header at top
        setHeaderVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 80) {
        // Scrolling down & past threshold - hide header
        setHeaderVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show header
        setHeaderVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleNavigate = (view) => {
    if (view === 'home') {
      setActiveCalculator(null); // null = Home page
    } else if (view === 'calculators') {
      setActiveCalculator('calculators'); // Show calculator menu
    } else if (view === 'profile') {
      setActiveCalculator('profile');
    } else if (view === 'jobs') {
      setActiveCalculator('jobs');
    } else if (view === 'estimates') {
      setActiveCalculator('estimates');
    }
  };

  // Handle back to calculator menu - stable reference
  const handleBackToMenu = () => {
    setActiveCalculator(null);
  };

  // Handle applying estimate to job
  const handleApplyEstimate = (estimate, jobId) => {
    if (jobId === 'new') {
      // Store estimate and navigate to jobs page to create new job
      setPendingEstimate(estimate);
      setActiveCalculator('jobs');
    } else {
      // Apply estimate to existing job
      // This will be handled by the Jobs component
      setPendingEstimate({ ...estimate, jobId });
      setActiveCalculator('jobs');
    }
  };

  // Handle PDF Export
  const handleExportPDF = () => {
    if (calculatorRef.current && calculatorRef.current.exportPDF) {
      try {
        calculatorRef.current.exportPDF();
        setShowMenu(false);
        
        // Show success toast
        setShowExportToast(true);
        setTimeout(() => setShowExportToast(false), 3000);
      } catch (error) {
        console.error('PDF export failed:', error);
        alert('Failed to export PDF. Please try again.');
      }
    }
  };

  // Dark mode colors
const colors = {
  headerBg: isDarkMode ? '#000000' : '#ffffff',
  headerText: isDarkMode ? '#ffffff' : '#111827',
  headerBorder: isDarkMode ? '#000000' : '#e5e7eb',
  menuBg: isDarkMode ? '#000000' : 'white',
  cardBorder: isDarkMode ? '#1a1a1a' : '#e5e7eb',
  cardText: isDarkMode ? '#ffffff' : '#111827',
};

  const renderCalculator = () => {
    switch(activeCalculator) {
      case 'voltage-drop':
        return <VoltageDropCalculator ref={calculatorRef} isDarkMode={isDarkMode} onBack={handleBackToMenu} />;
      case 'ohms-law':
        return <OhmsLawCalculator ref={calculatorRef} isDarkMode={isDarkMode} onBack={handleBackToMenu} />;
      case 'box-fill':
        return <BoxFillCalculator ref={calculatorRef} isDarkMode={isDarkMode} onBack={handleBackToMenu} />;
      case 'conduit-fill':
        return <ConduitFillCalculator ref={calculatorRef} isDarkMode={isDarkMode} onBack={handleBackToMenu} />;
      case 'ampacity':
        return <AmpacityLookupCalculator ref={calculatorRef} isDarkMode={isDarkMode} onBack={handleBackToMenu} />;
      case 'motor-calculations':
        return <MotorCalculations ref={calculatorRef} isDarkMode={isDarkMode} onBack={handleBackToMenu} />;
      case 'load-calculations':
        return <LoadCalculations ref={calculatorRef} isDarkMode={isDarkMode} onBack={handleBackToMenu} />;
      case 'transformer-sizing':
        return <TransformerSizingCalculator ref={calculatorRef} isDarkMode={isDarkMode} onBack={handleBackToMenu} />;
      case 'service-entrance':
        return <ServiceEntranceSizing ref={calculatorRef} isDarkMode={isDarkMode} onBack={handleBackToMenu} />;
      case 'grounding-bonding':
        return <GroundingBondingCalculator ref={calculatorRef} isDarkMode={isDarkMode} onBack={handleBackToMenu} />;
      case 'conduit-bending':
        return <ConduitBendingCalculator ref={calculatorRef} isDarkMode={isDarkMode} onBack={handleBackToMenu} />;
      case 'lighting':
        return <LightingCalculator ref={calculatorRef} isDarkMode={isDarkMode} onBack={handleBackToMenu} />;
      case 'vfd-sizing':
        return <VFDSizingCalculator ref={calculatorRef} isDarkMode={isDarkMode} onBack={handleBackToMenu} />;
      case 'reactance-impedance':
        return <ReactanceImpedanceCalculator ref={calculatorRef} isDarkMode={isDarkMode} onBack={handleBackToMenu} />;
      case 'power-factor':
        return <PowerFactorCorrection ref={calculatorRef} isDarkMode={isDarkMode} onBack={handleBackToMenu} />;
      case 'power-triangle':
        return <PowerTriangleCalculator ref={calculatorRef} isDarkMode={isDarkMode} onBack={handleBackToMenu} />;
      case 'three-phase-power':
        return <ThreePhasePowerCalculator ref={calculatorRef} isDarkMode={isDarkMode} onBack={handleBackToMenu} />;
      case 'calculators':
        return <CalculatorMenu 
          isDarkMode={isDarkMode} 
          onSelectCalculator={setActiveCalculator}
        />;
      case 'profile':
        return <Profile isDarkMode={isDarkMode} />;
      case 'jobs':
        return <Jobs 
          isDarkMode={isDarkMode} 
          jobs={jobs}
          addJob={addJob}
          updateJob={updateJob}
          deleteJob={deleteJob}
          pendingEstimate={pendingEstimate}
          onEstimateApplied={() => setPendingEstimate(null)}
        />;
      case 'estimates':
        return <Estimates 
          isDarkMode={isDarkMode}
          onApplyToJob={handleApplyEstimate}
        />;
      default:
        return <Home isDarkMode={isDarkMode} jobs={jobs} />;
    }
  };

  const getHeaderInfo = () => {
    if (!activeCalculator) {
      return { title: 'Home', icon: HomeIcon };
    }
    if (activeCalculator === 'calculators') {
      return { title: 'Calculator Menu', icon: Calculator };
    }
    if (activeCalculator === 'profile') {
      return { title: 'Profile', icon: User };
    }
    if (activeCalculator === 'jobs') {
      return { title: 'Job Log', icon: Briefcase };
    }
    if (activeCalculator === 'estimates') {
      return { title: 'Estimates', icon: FileText };
    }
    
    const headerMap = {
      'voltage-drop': { title: 'Voltage Drop', icon: Zap },
      'ohms-law': { title: "Ohm's Law", icon: Plug },
      'reactance-impedance': { title: 'Reactance & Impedance', icon: Waves },
      'power-factor': { title: 'Power Factor Correction', icon: Activity },
      'box-fill': { title: 'Box Fill', icon: Package },
      'conduit-fill': { title: 'Conduit Fill', icon: Wrench },
      'ampacity': { title: 'Ampacity', icon: AlertTriangle },
      'motor-calculations': { title: 'Motors', icon: Settings },
      'load-calculations': { title: 'Load Calculations', icon: BarChart3 },
      'transformer-sizing': { title: 'Transformers', icon: Cpu },
      'service-entrance': { title: 'Service Entrance Sizing', icon: Building },
      'grounding-bonding': { title: 'Grounding & Bonding', icon: Shield },
      'conduit-bending': { title: 'Conduit Bending', icon: Maximize2 },
      'lighting': { title: 'Lighting', icon: Lightbulb },
      'vfd-sizing': { title: 'VFD Sizing', icon: Gauge },
      'power-triangle': { title: 'Power Triangle', icon: Triangle },
      'three-phase-power': { title: 'Three-Phase Power', icon: Zap }
    };
    
    return headerMap[activeCalculator] || { title: 'Electrician\'s Toolkit', icon: Calculator };
  };

  const headerInfo = getHeaderInfo();
  const HeaderIcon = headerInfo.icon;

  return (
    <div className="App" style={{ background: isDarkMode ? '#000000' : '#ffffff' }}>
      {/* Persistent Header - Always Visible */}
      <div style={{ 
        background: isDarkMode ? '#000000' : '#2563eb',
        padding: '0.5rem 1rem',
        borderBottom: `1px solid ${colors.headerBorder}`,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: '48px',
        transform: headerVisible ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s ease-in-out',
        paddingTop: 'max(0.5rem, env(safe-area-inset-top))',
        paddingLeft: 'max(1rem, env(safe-area-inset-left))',
        paddingRight: 'max(1rem, env(safe-area-inset-right))'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem' 
        }}>
          <HeaderIcon size={20} color="white" strokeWidth={2} />
          <h1 style={{ 
            fontSize: '1rem', 
            fontWeight: '600',
            color: 'white',
            margin: 0,
            letterSpacing: '-0.01em'
          }}>
            {headerInfo.title}
          </h1>
        </div>
        
        {/* Menu Button */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowMenu(!showMenu)}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '40px',
              minHeight: '40px',
              lineHeight: 1
            }}
          >
            <Menu size={24} color="white" style={{ display: 'block', flexShrink: 0 }} />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <>
              {/* Backdrop */}
              <div 
                onClick={() => setShowMenu(false)}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 998
                }}
              />
              
              {/* Menu */}
              <div style={{
                position: 'absolute',
                top: '2.5rem',
                right: 0,
                zIndex: 999,
                background: colors.menuBg,
                border: `1px solid ${colors.cardBorder}`,
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                minWidth: '200px',
                overflow: 'hidden'
              }}>
                <div style={{ padding: '0.5rem 0' }}>
                  {/* Export PDF Button - Only show when calculator is active */}
                  {activeCalculator && activeCalculator !== 'profile' && activeCalculator !== 'jobs' && activeCalculator !== 'calculators' && activeCalculator !== 'estimates' && (
                    <>
                      <button
                        onClick={handleExportPDF}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          color: colors.cardText,
                          fontSize: '0.875rem',
                          fontWeight: '500'
                        }}
                        onMouseEnter={(e) => e.target.style.background = isDarkMode ? '#374151' : '#f3f4f6'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        <FileDown size={16} />
                        <span>Export to PDF</span>
                      </button>
                      <div style={{
                        height: '1px',
                        background: colors.cardBorder,
                        margin: '0.5rem 0'
                      }} />
                    </>
                  )}
                  
                  {/* Dark Mode Toggle */}
                  <button
                    onClick={() => {
                      setIsDarkMode(!isDarkMode);
                      setShowMenu(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      color: colors.cardText,
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                    onMouseEnter={(e) => e.target.style.background = isDarkMode ? '#374151' : '#f3f4f6'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                    <span>{isDarkMode ? '☀️' : '🌙'}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div style={{ 
        paddingBottom: 'calc(60px + env(safe-area-inset-bottom))',
        paddingTop: 'calc(48px + env(safe-area-inset-top))',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
        position: 'relative',
        minHeight: '100vh',
        boxSizing: 'border-box'
      }}>
        {!activeCalculator ? (
          renderCalculator()
        ) : (
          <div style={{ 
            minHeight: 'calc(100vh - 3.5rem)', 
            padding: activeCalculator === 'calculators' || activeCalculator === 'jobs' || activeCalculator === 'profile' || activeCalculator === 'estimates' ? '0' : '1rem',
            paddingBottom: '5rem'
          }}>
            {renderCalculator()}
          </div>
        )}
      </div>

      {/* Export Success Toast */}
      {showExportToast && (
        <div style={{
          position: 'fixed',
          bottom: '6rem',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#10b981',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          animation: 'slideUp 0.3s ease-out',
          maxWidth: '90%',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '1.25rem' }}>✓</span>
          <span>PDF saved to Downloads</span>
        </div>
      )}
      
      <BottomNavigation 
        onNavigate={handleNavigate}
        currentView={
          activeCalculator === 'profile' 
            ? 'profile'
            : activeCalculator === 'jobs'
            ? 'jobs'
            : activeCalculator === 'estimates'
            ? 'estimates'
            : activeCalculator === 'calculators'
            ? 'calculators'
            : activeCalculator 
            ? 'calculators' 
            : 'home'
        }
        isDarkMode={isDarkMode}
      />
    </div>
  );
}

export default App;