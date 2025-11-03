import React, { useState, useRef, useEffect } from 'react';
import { Menu, FileDown, Omega, Ruler, Plug, Package, TrendingDown, SquareDivide, Circle, Target, Tally3, Cable, Globe, CornerDownRight, AlertTriangle, Settings, BarChart3, Radio, Building, Shield, Maximize2, Lightbulb, Gauge, Waves, Activity, Calculator, User, Briefcase, Triangle, Home as HomeIcon, FileText, Receipt, Box, ArrowDown, ArrowUp, Minus, Sun, Zap } from 'lucide-react';
import CalculatorMenu from './features/tools/calculators/CalculatorMenu.jsx';
import VoltageDropCalculator from './features/tools/calculators/VoltageDropCalculator.jsx';
import OhmsLawCalculator from './features/tools/calculators/OhmsLawCalculator.jsx';
import BoxFillCalculator from './features/tools/calculators/BoxFillCalculator.jsx';
import PullBoxCalculator from './features/tools/calculators/PullBoxCalculator.jsx';
import ConduitFillCalculator from './features/tools/calculators/ConduitFillCalculator.jsx';
import AmpacityLookupCalculator from './features/tools/calculators/AmpacityLookupCalculator.jsx';
import MotorCalculations from './features/calculators/MotorCalculations.jsx';
import LoadCalculations from './features/calculators/LoadCalculations.jsx';
import TransformerSizingCalculator from './features/calculators/TransformerSizingCalculator.jsx';
import ServiceEntranceSizing from './features/calculators/ServiceEntranceSizing.jsx';
import GroundingBondingCalculator from './features/calculators/GroundingBondingCalculator.jsx';
import ConduitBendingCalculator from './features/calculators/ConduitBendingCalculator.jsx';
import LightingCalculator from './features/calculators/lighting/LightingCalculator.jsx';
import ReceptacleCalculator from './features/calculators/ReceptacleCalculator.jsx';
import BottomNavigation from './components/BottomNavigation.jsx';
import VFDSizingCalculator from './features/calculators/VFDSizingCalculator.jsx';
import ReactanceImpedanceCalculator from './features/calculators/ReactanceImpedance/ReactanceImpedanceCalculator.jsx';
import PowerFactorCorrection from './features/calculators/PowerFactorCorrection.jsx';
import PowerTriangleCalculator from './features/calculators/PowerTriangleCalculator.jsx';
import ThreePhasePowerCalculator from './features/calculators/ThreePhasePowerCalculator.jsx';
import UndergroundDepthCalculator from './features/calculators/UndergroundDepthCalculator.jsx';
import OverheadClearanceCalculator from './features/calculators/OverheadClearanceCalculator.jsx';
import WorkingSpaceCalculator from './features/calculators/WorkingSpaceCalculator.jsx';
import NeutralSizingCalculator from './features/calculators/NeutralSizingCalculator.jsx';
import SolarPVCalculator from './features/calculators/SolarPVCalculator.jsx';
import EVChargingCalculator from './features/calculators/EVChargingCalculator.jsx';
import Home from './features/home/Home.jsx';
import Profile from './features/profile/Profile.jsx';
import Jobs from './features/jobs/Jobs.jsx';
import Estimates from './features/estimates/Estimates.jsx';
import Invoices from './features/invoices/Invoices.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import Header from './components/Header.jsx';
import { getColors } from './theme';
import './App.css';

function App() {
  const [activeCalculator, setActiveCalculator] = useState(() => {
    // Check if we're on verify-email page from URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('token')) {
      return 'verify-email';
    }
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
  const [navigationData, setNavigationData] = useState(null);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [clockedInJob, setClockedInJob] = useState(null); // NEW: Track clocked-in job instantly
  
  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.view !== undefined) {
        setActiveCalculator(event.state.view);
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Set initial state
    if (!window.history.state) {
      window.history.replaceState({ view: activeCalculator }, '');
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Update browser history when view changes
  useEffect(() => {
    // Don't push state on initial load
    if (window.history.state && window.history.state.view !== activeCalculator) {
      window.history.pushState({ view: activeCalculator }, '');
    }
  }, [activeCalculator]);

  // Save active view to localStorage whenever it changes
  useEffect(() => {
    if (activeCalculator === null) {
      localStorage.setItem('activeView', '');
    } else if (activeCalculator !== 'verify-email') {
      // Don't save verify-email to localStorage
      localStorage.setItem('activeView', activeCalculator);
    }
  }, [activeCalculator]);

  // Save dark mode preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('isDarkMode', isDarkMode);
  }, [isDarkMode]);

 useEffect(() => {
  const newColor = isDarkMode ? '#121212' : '#f9fafb';
  
  // Update meta theme-color
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', newColor);
  }
  
  // ALSO set body background to prevent black showing through
  document.body.style.backgroundColor = newColor;
  
  // Set the html element background too
  document.documentElement.style.backgroundColor = newColor;
}, [isDarkMode]);

   
  // Update theme-color meta tag based on dark mode
  useEffect(() => {
    const updateThemeColor = () => {
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', isDarkMode ? '#1e1e1e' : '#2563eb');
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

  useEffect(() => {
    // Scroll to top whenever the view changes
    window.scrollTo(0, 0);
  }, [activeCalculator]);
  
  // Ref to access calculator's export function
  const calculatorRef = useRef(null);

  // Handle scroll to show/hide header
  useEffect(() => {
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

  // Clear navigation data when leaving estimates page
useEffect(() => {
  if (activeCalculator !== 'estimates') {
    setNavigationData(null);
  }
}, [activeCalculator]);

  const handleNavigate = (view, data = null) => {
      if (view === 'home') {
        setActiveCalculator(null);
      } else if (view === 'calculators') {
        setActiveCalculator('calculators');
      } else if (view === 'profile') {
        setActiveCalculator('profile');
      } else if (view === 'jobs') {
        setActiveCalculator('jobs');
      } else if (view === 'estimates') {
        setActiveCalculator('estimates');
        if (data) {
          setNavigationData(data);
        }
      } else if (view === 'invoices') {
        setActiveCalculator('invoices');
      }
    };

  const handleBackToMenu = () => {
    setActiveCalculator('calculators');
  };

  const exportSuccessHandler = () => {
    setShowExportToast(true);
    setTimeout(() => setShowExportToast(false), 3000);
  };

  const handleExportPDF = () => {
    if (calculatorRef.current && calculatorRef.current.exportPDF) {
      calculatorRef.current.exportPDF();
      exportSuccessHandler();
    }
  };

  const handleApplyEstimate = (estimateData) => {
    setPendingEstimate(estimateData);
    setActiveCalculator('jobs');
  };

  const renderCalculator = () => {
    switch (activeCalculator) {
      case 'voltage-drop':
        return <VoltageDropCalculator ref={calculatorRef} isDarkMode={isDarkMode} onBack={handleBackToMenu} onExportSuccess={exportSuccessHandler} />;
      case 'ohms-law':
        return <OhmsLawCalculator ref={calculatorRef} isDarkMode={isDarkMode} onBack={handleBackToMenu} onExportSuccess={exportSuccessHandler} />;
      case 'box-fill':
        return <BoxFillCalculator ref={calculatorRef} isDarkMode={isDarkMode} onBack={handleBackToMenu} onExportSuccess={exportSuccessHandler} />;
      case 'conduit-fill':
        return <ConduitFillCalculator ref={calculatorRef} isDarkMode={isDarkMode} onBack={handleBackToMenu} onExportSuccess={exportSuccessHandler} />;
      case 'ampacity':
        return <AmpacityLookupCalculator ref={calculatorRef} isDarkMode={isDarkMode} onBack={handleBackToMenu} onExportSuccess={exportSuccessHandler} />;
      case 'motor-calculations':
        return <MotorCalculations ref={calculatorRef} isDarkMode={isDarkMode} onBack={handleBackToMenu} onExportSuccess={exportSuccessHandler} />;
      case 'load-calculations':
        return <LoadCalculations ref={calculatorRef} isDarkMode={isDarkMode} onBack={handleBackToMenu} onExportSuccess={exportSuccessHandler} />;
      case 'transformer-sizing':
        return <TransformerSizingCalculator ref={calculatorRef} isDarkMode={isDarkMode} onBack={handleBackToMenu} onExportSuccess={exportSuccessHandler} />;
      case 'service-entrance':
        return <ServiceEntranceSizing ref={calculatorRef} isDarkMode={isDarkMode} onBack={handleBackToMenu} onExportSuccess={exportSuccessHandler} />;
      case 'grounding-bonding':
        return <GroundingBondingCalculator ref={calculatorRef} isDarkMode={isDarkMode} onBack={handleBackToMenu} onExportSuccess={exportSuccessHandler} />;
      case 'conduit-bending':
        return <ConduitBendingCalculator ref={calculatorRef} isDarkMode={isDarkMode} onBack={handleBackToMenu} onExportSuccess={exportSuccessHandler} />;
      case 'lighting':
        return <LightingCalculator ref={calculatorRef} isDarkMode={isDarkMode} onBack={handleBackToMenu} onExportSuccess={exportSuccessHandler} />;
      case 'receptacles':
        return <ReceptacleCalculator ref={calculatorRef} isDarkMode={isDarkMode} onBack={handleBackToMenu} onExportSuccess={exportSuccessHandler} />;
      case 'vfd-sizing':
        return <VFDSizingCalculator ref={calculatorRef} isDarkMode={isDarkMode} onBack={handleBackToMenu} onExportSuccess={exportSuccessHandler} />;
      case 'reactance-impedance':
        return <ReactanceImpedanceCalculator ref={calculatorRef} isDarkMode={isDarkMode} onBack={handleBackToMenu} onExportSuccess={exportSuccessHandler} />;
      case 'power-factor':
        return <PowerFactorCorrection ref={calculatorRef} isDarkMode={isDarkMode} onBack={handleBackToMenu} onExportSuccess={exportSuccessHandler} />;
      case 'power-triangle':
        return <PowerTriangleCalculator ref={calculatorRef} isDarkMode={isDarkMode} onBack={handleBackToMenu} onExportSuccess={exportSuccessHandler} />;
      case 'three-phase-power':
        return <ThreePhasePowerCalculator ref={calculatorRef} isDarkMode={isDarkMode} onBack={handleBackToMenu} onExportSuccess={exportSuccessHandler} />;
      case 'pull-box':
        return <PullBoxCalculator ref={calculatorRef} isDarkMode={isDarkMode} onBack={handleBackToMenu} onExportSuccess={exportSuccessHandler} />;
      case 'underground-depth':
        return <UndergroundDepthCalculator ref={calculatorRef} isDarkMode={isDarkMode} onBack={handleBackToMenu} onExportSuccess={exportSuccessHandler} />;
      case 'overhead-clearance':
        return <OverheadClearanceCalculator ref={calculatorRef} isDarkMode={isDarkMode} onBack={handleBackToMenu} onExportSuccess={exportSuccessHandler} />;
      case 'working-space':
        return <WorkingSpaceCalculator ref={calculatorRef} isDarkMode={isDarkMode} onBack={handleBackToMenu} onExportSuccess={exportSuccessHandler} />;
      case 'neutral-sizing':
        return <NeutralSizingCalculator ref={calculatorRef} isDarkMode={isDarkMode} onBack={handleBackToMenu} onExportSuccess={exportSuccessHandler} />;
      case 'solar-pv':
        return <SolarPVCalculator ref={calculatorRef} isDarkMode={isDarkMode} onBack={handleBackToMenu} onExportSuccess={exportSuccessHandler} />;
      case 'ev-charging':
        return <EVChargingCalculator ref={calculatorRef} isDarkMode={isDarkMode} onBack={handleBackToMenu} onExportSuccess={exportSuccessHandler} />;
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
          onNavigateToEstimates={(data) => handleNavigate('estimates', data)}
          onClockedInJobChange={setClockedInJob} // NEW: Instant callback
        />;
      case 'estimates':
        return <Estimates 
          isDarkMode={isDarkMode}
          onApplyToJob={handleApplyEstimate}
          pendingEstimateData={pendingEstimate}
          onClearPendingData={() => setPendingEstimate(null)}
          navigationData={navigationData}
        />;
      case 'invoices':
        return <Invoices isDarkMode={isDarkMode} />;
      case 'verify-email':
        return <VerifyEmail isDarkMode={isDarkMode} onNavigate={handleNavigate} />;
      default:
        return <Home isDarkMode={isDarkMode} />;
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
    if (activeCalculator === 'invoices') {
      return { title: 'Invoices', icon: Receipt };
    }
    if (activeCalculator === 'verify-email') {
      return { title: 'Verify Email', icon: User };
    }
    
    const headerMap = {
      'voltage-drop': { title: 'Voltage Drop', icon: TrendingDown },
      'ohms-law': { title: "Ohm's Law", icon: SquareDivide },
      'reactance-impedance': { title: 'Reactance & Impedance', icon: Omega },
      'power-factor': { title: 'Power Factor Correction', icon: Target },
      'box-fill': { title: 'Box Fill', icon: Package },
      'conduit-fill': { title: 'Conduit Fill', icon: Circle },
      'ampacity': { title: 'Ampacity', icon: Cable },
      'motor-calculations': { title: 'Motors', icon: Settings },
      'load-calculations': { title: 'Load Calculations', icon: BarChart3 },
      'transformer-sizing': { title: 'Transformers', icon: Radio },
      'service-entrance': { title: 'Service Entrance Sizing', icon: Building },
      'grounding-bonding': { title: 'Grounding & Bonding', icon: Globe },
      'conduit-bending': { title: 'Conduit Bending', icon: CornerDownRight },
      'lighting': { title: 'Lighting', icon: Lightbulb },
      'receptacles': { title: 'Receptacles', icon: Plug },
      'vfd-sizing': { title: 'VFD Sizing', icon: Gauge },
      'power-triangle': { title: 'Power Triangle', icon: Triangle },
      'three-phase-power': { title: 'Three-Phase Power', icon: Tally3 },
      'pull-box': { title: 'Pull Box Sizing', icon: Box },
      'underground-depth': { title: 'Underground Depth', icon: ArrowDown },
      'overhead-clearance': { title: 'Overhead Clearance', icon: ArrowUp },
      'working-space': { title: 'Working Space', icon: Ruler },
      'neutral-sizing': { title: 'Neutral Sizing', icon: Minus },
      'solar-pv': { title: 'Solar PV', icon: Sun },
      'ev-charging': { title: 'EV Charging', icon: Zap }
    };
    
    return headerMap[activeCalculator] || { title: 'Electrician\'s Toolkit', icon: Calculator };
  };

  const headerInfo = getHeaderInfo();

  // Hide bottom nav on verify-email page
  const showBottomNav = activeCalculator !== 'verify-email';

  return (
    <div className="App" style={{ background: isDarkMode ? '#121212' : '#f9fafb', overscrollBehavior: 'none' }}>
      <Header 
        headerInfo={headerInfo}
        isDarkMode={isDarkMode}
        headerVisible={headerVisible}
        showMenu={showMenu}
        setShowMenu={setShowMenu}
        onNavigate={handleNavigate}
        setIsDarkMode={setIsDarkMode}
        clockedInJob={clockedInJob} // NEW: Just pass the job
      />

      {/* Content Area */}
      <div style={{ 
        paddingBottom: showBottomNav ? 'calc(65px + env(safe-area-inset-bottom))' : '0',
        paddingTop: 'calc(48px + env(safe-area-inset-top)',
        paddingLeft: activeCalculator === 'calculators' ? '0' : 'env(safe-area-inset-left)',
        paddingRight: activeCalculator === 'calculators' ? '0' : 'env(safe-area-inset-right)',
        position: 'relative',
        minHeight: '100vh',
        boxSizing: 'border-box'
      }}>
        {!activeCalculator ? (
                  renderCalculator()
                ) : (
                  <div style={{ 
                    minHeight: 'calc(100vh - 3.5rem)', 
                    paddingTop: activeCalculator === 'calculators' || activeCalculator === 'jobs' || activeCalculator === 'profile' || activeCalculator === 'estimates' || activeCalculator === 'invoices' || activeCalculator === 'verify-email' ? '0' : '1rem',
                    paddingRight: activeCalculator === 'calculators' || activeCalculator === 'jobs' || activeCalculator === 'profile' || activeCalculator === 'estimates' || activeCalculator === 'invoices' || activeCalculator === 'verify-email' ? '0' : '1rem',
                    paddingLeft: activeCalculator === 'calculators' || activeCalculator === 'jobs' || activeCalculator === 'profile' || activeCalculator === 'estimates' || activeCalculator === 'invoices' || activeCalculator === 'verify-email' ? '0' : '1rem',
                    paddingBottom: '0'
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
      
      {showBottomNav && (
        <BottomNavigation 
          onNavigate={handleNavigate}
          currentView={
            activeCalculator === 'jobs'
              ? 'jobs'
              : activeCalculator === 'estimates'
              ? 'estimates'
              : activeCalculator === 'invoices'
              ? 'invoices'
              : activeCalculator === 'profile' 
              ? 'profile'
              : activeCalculator === 'calculators'
              ? 'calculators'
              : activeCalculator 
              ? 'calculators' 
              : 'home'
          }
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
}

export default App;