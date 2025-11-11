import React, { useState, useRef, useEffect } from 'react';
import { Menu, FileDown, Omega, Wrench, Ruler, Plug, Package, TrendingDown, SquareDivide, Circle, Target, Tally3, Cable, Globe, CornerDownRight, AlertTriangle, Settings, BarChart3, Radio, Building, Shield, Maximize2, Lightbulb, Gauge, Waves, Activity, Calculator, User, Briefcase, Triangle, Home as HomeIcon, FileText, Receipt, Box, ArrowDown, ArrowUp, Minus, Sun, Zap, TriangleRight } from 'lucide-react';
import { PiInvoice, PiComputerTower, PiShovel, PiNumberCircleThree, PiLineSegments, PiPipe } from 'react-icons/pi';
import { TbCircuitGround, TbCircuitMotor, TbCircuitInductor } from 'react-icons/tb';
import { FaCircleHalfStroke } from 'react-icons/fa6';
import { FiDivideCircle } from 'react-icons/fi';
import { GiClamp } from 'react-icons/gi';
import CalculatorMenu from './features/tools/calculators/CalculatorMenu.jsx';
import VoltageDropCalculator from './features/tools/calculators/VoltageDropCalculator.jsx';
import OhmsLawCalculator from './features/tools/calculators/OhmsLawCalculator.jsx';
import BoxFillCalculator from './features/tools/calculators/BoxFillCalculator.jsx';
import PullBoxCalculator from './features/tools/calculators/PullBoxCalculator.jsx';
import ConduitFillCalculator from './features/tools/calculators/ConduitFillCalculator.jsx';
import AmpacityLookupCalculator from './features/tools/calculators/AmpacityLookupCalculator.jsx';
import MotorCalculations from './features/tools/calculators/MotorCalculations.jsx';
import LoadCalculations from './features/tools/calculators/LoadCalculations.jsx';
import TransformerSizingCalculator from './features/tools/calculators/TransformerSizingCalculator.jsx';
import ServiceEntranceSizing from './features/tools/calculators/ServiceEntranceSizing.jsx';
import GroundingBondingCalculator from './features/tools/calculators/GroundingBondingCalculator.jsx';
import ConduitBendingCalculator from './features/tools/calculators/ConduitBendingCalculator.jsx';
import LightingCalculator from './features/tools/calculators/lighting/LightingCalculator.jsx';
import ReceptacleCalculator from './features/tools/calculators/ReceptacleCalculator.jsx';
import BottomNavigation from './components/BottomNavigation.jsx';
import VFDSizingCalculator from './features/tools/calculators/VFDSizingCalculator.jsx';
import ReactanceImpedanceCalculator from './features/tools/calculators/ReactanceImpedance/ReactanceImpedanceCalculator.jsx';
import PowerFactorCorrection from './features/tools/calculators/PowerFactorCorrection.jsx';
import PowerTriangleCalculator from './features/tools/calculators/PowerTriangleCalculator.jsx';
import ThreePhasePowerCalculator from './features/tools/calculators/ThreePhasePowerCalculator.jsx';
import UndergroundDepthCalculator from './features/tools/calculators/UndergroundDepthCalculator.jsx';
import OverheadClearanceCalculator from './features/tools/calculators/OverheadClearanceCalculator.jsx';
import WorkingSpaceCalculator from './features/tools/calculators/WorkingSpaceCalculator.jsx';
import NeutralSizingCalculator from './features/tools/calculators/NeutralSizingCalculator.jsx';
import SolarPVCalculator from './features/tools/calculators/SolarPVCalculator.jsx';
import EVChargingCalculator from './features/tools/calculators/EVChargingCalculator.jsx';
import SupportSpacingCalculator from './features/tools/calculators/SupportSpacingCalculator.jsx';
import Home from './features/home/Home.jsx';
import Tools from './features/tools/Tools';
import Profile from './features/profile/Profile.jsx';
import Jobs from './features/jobs/Jobs.jsx';
import Estimates from './features/estimates/Estimates.jsx';
import Invoices from './features/invoices/Invoices.jsx';
import Header from './components/Header.jsx';
import { getColors } from './theme';
import { auth } from './firebase/firebase';
import { onAuthStateChanged, sendEmailVerification } from 'firebase/auth';
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
  const [navigationData, setNavigationData] = useState(null);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [clockedInJob, setClockedInJob] = useState(null);
  const [prefilledJobDate, setPrefilledJobDate] = useState(null);
  const [user, setUser] = useState(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  
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

  // ✅ UPDATED: Now uses Firebase's native emailVerified property
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Reload user to get fresh emailVerified status
        await currentUser.reload();
        setIsEmailVerified(currentUser.emailVerified);
      } else {
        setIsEmailVerified(false);
      }
    });

    return () => unsubscribe();
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
    } else {
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

  const handleNavigate = (view, data) => {
    if (data) {
      setNavigationData(data);
    }
    setActiveCalculator(view);
  };

  const handleExportSuccess = () => {
    setShowExportToast(true);
    setTimeout(() => setShowExportToast(false), 3000);
  };

  const handleJobCreatedFromEstimate = (estimate) => {
    setPendingEstimate(estimate);
    setActiveCalculator('jobs');
  };

  const handleApplyEstimate = (estimate) => {
    setPendingEstimate(estimate);
  };

  const handleClockIn = (job) => {
    setClockedInJob(job);
  };

  const handleClockOut = () => {
    setClockedInJob(null);
  };

  const handleAddJobFromCalendar = (date) => {
    setPrefilledJobDate(date);
    setActiveCalculator('jobs');
  };

  // ✅ UPDATED: Now uses Firebase's native sendEmailVerification
  const handleResendVerification = async () => {
    if (!user) return;

    try {
      const actionCodeSettings = {
        url: window.location.origin,
        handleCodeInApp: false,
      };
      
      await sendEmailVerification(user, actionCodeSettings);
      alert('Verification email sent! Please check your inbox.');
    } catch (error) {
      console.error('Error sending verification email:', error);
      alert('Failed to send verification email. Please try again later.');
    }
  };

  const renderCalculator = () => {
    switch (activeCalculator) {
      case 'voltage-drop':
        return <VoltageDropCalculator isDarkMode={isDarkMode} onExportSuccess={handleExportSuccess} />;
      case 'ohms-law':
        return <OhmsLawCalculator isDarkMode={isDarkMode} onExportSuccess={handleExportSuccess} />;
      case 'reactance-impedance':
        return <ReactanceImpedanceCalculator isDarkMode={isDarkMode} onExportSuccess={handleExportSuccess} />;
      case 'power-factor':
        return <PowerFactorCorrection isDarkMode={isDarkMode} onExportSuccess={handleExportSuccess} />;
      case 'box-fill':
        return <BoxFillCalculator isDarkMode={isDarkMode} onExportSuccess={handleExportSuccess} />;
      case 'pull-box':
        return <PullBoxCalculator isDarkMode={isDarkMode} onExportSuccess={handleExportSuccess} />;
      case 'conduit-fill':
        return <ConduitFillCalculator isDarkMode={isDarkMode} onExportSuccess={handleExportSuccess} />;
      case 'ampacity':
        return <AmpacityLookupCalculator isDarkMode={isDarkMode} onExportSuccess={handleExportSuccess} />;
      case 'motor-calculations':
        return <MotorCalculations isDarkMode={isDarkMode} onExportSuccess={handleExportSuccess} />;
      case 'load-calculations':
        return <LoadCalculations isDarkMode={isDarkMode} onExportSuccess={handleExportSuccess} />;
      case 'transformer-sizing':
        return <TransformerSizingCalculator isDarkMode={isDarkMode} onExportSuccess={handleExportSuccess} />;
      case 'service-entrance':
        return <ServiceEntranceSizing isDarkMode={isDarkMode} onExportSuccess={handleExportSuccess} />;
      case 'grounding-bonding':
        return <GroundingBondingCalculator isDarkMode={isDarkMode} onExportSuccess={handleExportSuccess} />;
      case 'conduit-bending':
        return <ConduitBendingCalculator isDarkMode={isDarkMode} onExportSuccess={handleExportSuccess} />;
      case 'lighting':
        return <LightingCalculator isDarkMode={isDarkMode} onExportSuccess={handleExportSuccess} />;
      case 'receptacles':
        return <ReceptacleCalculator isDarkMode={isDarkMode} onExportSuccess={handleExportSuccess} />;
      case 'vfd-sizing':
        return <VFDSizingCalculator isDarkMode={isDarkMode} onExportSuccess={handleExportSuccess} />;
      case 'power-triangle':
        return <PowerTriangleCalculator isDarkMode={isDarkMode} onExportSuccess={handleExportSuccess} />;
      case 'three-phase-power':
        return <ThreePhasePowerCalculator isDarkMode={isDarkMode} onExportSuccess={handleExportSuccess} />;
      case 'underground-depth':
        return <UndergroundDepthCalculator isDarkMode={isDarkMode} onExportSuccess={handleExportSuccess} />;
      case 'overhead-clearance':
        return <OverheadClearanceCalculator isDarkMode={isDarkMode} onExportSuccess={handleExportSuccess} />;
      case 'working-space':
        return <WorkingSpaceCalculator isDarkMode={isDarkMode} onExportSuccess={handleExportSuccess} />;
      case 'neutral-sizing':
        return <NeutralSizingCalculator isDarkMode={isDarkMode} onExportSuccess={handleExportSuccess} />;
      case 'solar-pv':
        return <SolarPVCalculator isDarkMode={isDarkMode} onExportSuccess={handleExportSuccess} />;
      case 'ev-charging':
        return <EVChargingCalculator isDarkMode={isDarkMode} onExportSuccess={handleExportSuccess} />;
      case 'support-spacing':
        return <SupportSpacingCalculator isDarkMode={isDarkMode} onExportSuccess={handleExportSuccess} />;
      case 'calculators':
        return <Tools isDarkMode={isDarkMode} onNavigate={handleNavigate} />;
      case 'profile':
        return <Profile isDarkMode={isDarkMode} />;
      case 'jobs':
        return (
            <Jobs 
              isDarkMode={isDarkMode}
              pendingEstimateData={pendingEstimate}
              onClearPendingData={() => setPendingEstimate(null)}
              onNavigateToEstimates={handleNavigate}
              onClockIn={handleClockIn}
              onClockOut={handleClockOut}
              prefilledDate={prefilledJobDate}
              onClearPrefilledDate={() => setPrefilledJobDate(null)}
              isEmailVerified={isEmailVerified}
              onResendVerification={handleResendVerification}
            />
        );
      case 'estimates':
        return (
            <Estimates 
              isDarkMode={isDarkMode}
              onJobCreated={handleJobCreatedFromEstimate}
              onApplyToJob={handleApplyEstimate}
              pendingEstimateData={pendingEstimate}
              onClearPendingData={() => setPendingEstimate(null)}
              navigationData={navigationData}
              onNavigateToJobs={(data) => handleNavigate('jobs', data)}
              isEmailVerified={isEmailVerified}
              onResendVerification={handleResendVerification}
            />
        );
      case 'invoices':
        return (
            <Invoices 
              isDarkMode={isDarkMode}
              isEmailVerified={isEmailVerified}
              onResendVerification={handleResendVerification}
            />
        );
      default:
        return <Home 
          isDarkMode={isDarkMode}
          onAddJobClick={handleAddJobFromCalendar}
        />;
    }
  };

  const getHeaderInfo = () => {
    if (!activeCalculator) {
      return { title: 'Home', icon: HomeIcon };
    }
    if (activeCalculator === 'calculators') {
  return { title: 'Tools', icon: Wrench };
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
      return { title: 'Invoices', icon: PiInvoice };
    }
    
    const headerMap = {
      'voltage-drop': { title: 'Voltage Drop', icon: TrendingDown },
      'ohms-law': { title: "Ohm's Law", icon: FiDivideCircle },
      'reactance-impedance': { title: 'Reactance & Impedance', icon: Omega },
      'power-factor': { title: 'Power Factor Correction', icon: Target },
      'box-fill': { title: 'Box Fill', icon: Package },
      'conduit-fill': { title: 'Conduit Fill', icon: FaCircleHalfStroke },
      'ampacity': { title: 'Ampacity', icon: Cable },
      'motor-calculations': { title: 'Motors', icon: TbCircuitMotor },
      'load-calculations': { title: 'Load Calculations', icon: BarChart3 },
      'transformer-sizing': { title: 'Transformers', icon: TbCircuitInductor },
      'service-entrance': { title: 'Service Entrance Sizing', icon: Building },
      'grounding-bonding': { title: 'Grounding & Bonding', icon: TbCircuitGround },
      'conduit-bending': { title: 'Conduit Bending', icon: PiPipe },
      'lighting': { title: 'Lighting', icon: Lightbulb },
      'receptacles': { title: 'Receptacle Spacing', icon: Plug },
      'vfd-sizing': { title: 'VFD Sizing', icon: PiComputerTower },
      'power-triangle': { title: 'Power Triangle', icon: TriangleRight },
      'three-phase-power': { title: 'Three-Phase Power', icon: PiNumberCircleThree },
      'pull-box': { title: 'Pull Box Sizing', icon: Box },
      'underground-depth': { title: 'Underground Depth', icon: PiShovel },
      'overhead-clearance': { title: 'Overhead Clearance', icon: ArrowUp },
      'working-space': { title: 'Working Space', icon: Ruler },
      'neutral-sizing': { title: 'Neutral Sizing', icon: PiLineSegments },
      'solar-pv': { title: 'Solar PV', icon: Sun },
      'ev-charging': { title: 'EV Charging', icon: Zap },
      'support-spacing': { title: 'Support Spacing', icon: GiClamp }
    };
    
    return headerMap[activeCalculator] || { title: 'Electrician\'s Toolkit', icon: Calculator };
  };

  const headerInfo = getHeaderInfo();

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
        clockedInJob={clockedInJob}
      />

      {/* Content Area */}
      <div style={{ 
        paddingBottom: 'calc(65px + env(safe-area-inset-bottom))',
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
                    paddingTop: activeCalculator === 'calculators' || activeCalculator === 'jobs' || activeCalculator === 'profile' || activeCalculator === 'estimates' || activeCalculator === 'invoices' ? '0' : '1rem',
                    paddingRight: activeCalculator === 'calculators' || activeCalculator === 'jobs' || activeCalculator === 'profile' || activeCalculator === 'estimates' || activeCalculator === 'invoices' ? '0' : '1rem',
                    paddingLeft: activeCalculator === 'calculators' || activeCalculator === 'jobs' || activeCalculator === 'profile' || activeCalculator === 'estimates' || activeCalculator === 'invoices' ? '0' : '1rem',
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
    </div>
  );
}

export default App;