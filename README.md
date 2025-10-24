# ⚡ Electrician Toolkit

> A comprehensive mobile-first business management platform for electrical contractors, combining 20+ NEC-compliant calculators with complete job tracking, estimating, invoicing, and payment processing.

[![Live Application](https://img.shields.io/badge/Live-Demo-brightgreen)](https://sprightly-melba-ff3436.netlify.app/)
[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12.4.0-orange)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📱 Overview

Electrician Toolkit is a full-featured web application designed specifically for electrical contractors and electricians running side work businesses. Built by a licensed electrician and full-stack developer, this tool bridges the gap between field calculations and business management, providing everything needed to run a small electrical contracting business from your mobile device.

**[🚀 Launch App](https://electrician-toolkit.vercel.app/)**

---

## ✨ Key Features

### 🧮 Professional Calculators (20+)

**Power & Load Calculations**
- **Voltage Drop Calculator** - Single/3-phase with automatic NEC compliance warnings
- **Ohm's Law Suite** - Basic calculations, series circuits, and parallel circuit analysis
- **Three Phase Power Calculator** - Complete 3-phase power calculations
- **Power Triangle Calculator** - Power factor and reactive power analysis
- **Power Factor Correction** - Capacitor sizing for PF improvement
- **Load Calculations** - Comprehensive electrical load analysis

**Conductor & Wire Sizing**
- **Ampacity Lookup Calculator** - Quick NEC Table 310.16 reference
- **Neutral Sizing Calculator** - Proper neutral conductor sizing
- **Service Entrance Sizing** - Service conductor and equipment sizing
- **Underground Depth Calculator** - Burial depth requirements per NEC

**Conduit & Raceways**
- **Conduit Fill Calculator** - NEC Chapter 9 compliant fill calculations
- **Conduit Bending Calculator** - Offset, kick, and saddle bend calculations
- **Pull Box Calculator** - Junction and pull box sizing per NEC 314.28
- **Box Fill Calculator** - Outlet and junction box volume calculations per NEC 314.16

**Specialty Calculators**
- **Motor Calculations** - FLC, OCP, and conductor sizing from NEC 430
- **Transformer Sizing Calculator** - Primary/secondary calculations
- **VFD Sizing Calculator** - Variable Frequency Drive sizing
- **EV Charging Calculator** - Electric vehicle charging load calculations
- **Solar PV Calculator** - Photovoltaic system calculations
- **Grounding/Bonding Calculator** - Equipment grounding conductor sizing
- **Receptacle Calculator** - Receptacle load and circuit requirements
- **Working Space Calculator** - NEC 110.26 working clearance requirements
- **Overhead Clearance Calculator** - Clearance requirements for overhead conductors
- **Reactance/Impedance Calculator** - Advanced circuit calculations

### 💼 Business Management Suite

**Job Management**
- Create and track electrical jobs
- Job status tracking with status tabs
- Job cards with detailed information
- Estimate selector for linking estimates to jobs
- Complete job history and documentation

**Professional Estimating**
- Assembly-based estimating system
- Labor hour calculations
- Material cost tracking
- Professional estimate generation
- Save and manage multiple estimates

**Invoice Management**
- Professional invoice creation
- PDF invoice generation with jsPDF
- Invoice tracking and history
- Client information management

**User Profile & Authentication**
- Secure Firebase authentication
- User profile management
- Persistent user data with Firestore
- Multi-device sync

### 📊 Technical Features

- **Mobile-First Design** - Optimized for smartphones and tablets
- **Progressive Web App (PWA)** - Install on mobile devices
- **Offline Capable** - Core calculators work without internet
- **Real-time Calculations** - Instant results as you type
- **NEC Compliance** - Built-in code references and warnings
- **Cloud Sync** - Firebase Firestore database for data persistence
- **Professional UI** - Lucide React icons and modern design
- **PDF Export** - Generate professional documents
- **Email Integration** - Resend API for notifications

---

## 🛠 Tech Stack

### Frontend
- **React 18.2.0** - Modern UI framework with hooks
- **Vite 6.3.6** - Lightning-fast build tool and dev server
- **Lucide React 0.544** - Professional icon library
- **CSS Modules** - Component-scoped styling

### Backend & Services
- **Firebase 12.4.0** - Authentication and Firestore database
- **Resend 6.1.2** - Transactional email API
- **jsPDF 3.0.3** - Client-side PDF generation

### Development Tools
- **Vitest 3.0.7** - Unit testing framework
- **jsdom 26.1.0** - Testing environment
- **Netlify CLI** - Deployment and hosting
- **gh-pages** - GitHub Pages deployment

---

## 🚀 Getting Started

### Prerequisites

```bash
Node.js 16+ 
npm or yarn
Git
Firebase account (for backend features)
```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/zacfisher1990/electrician-toolkit.git
   cd electrician-toolkit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start development server**
   ```bash
   npm start
   ```
   
   Opens at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

Production files will be in the `dist` folder.

### Testing

```bash
npm test
```

---

## 📖 Usage

### For Electricians

**Quick Calculations**
1. Navigate to Calculators from the home screen
2. Select the calculator you need
3. Enter your parameters (voltage, load, distance, etc.)
4. View instant results with NEC compliance warnings
5. Reference included code articles

**Managing Jobs**
1. Create a new job from the Jobs screen
2. Add client information and job details
3. Link estimates to jobs
4. Track job status (Quoted, In Progress, Completed)
5. Generate invoices when complete

**Creating Estimates**
1. Navigate to Estimates
2. Add line items with labor and material costs
3. Calculate total with markup
4. Save estimate to link with jobs
5. Export to PDF for client presentation

**Generating Invoices**
1. Complete job and navigate to Invoices
2. Create new invoice from job data
3. Review and customize invoice details
4. Generate professional PDF invoice
5. Email or download for delivery

---

## 📐 Calculator Details

### NEC Compliance

All calculators reference current National Electrical Code articles:

- **Article 110** - Requirements for Electrical Installations
- **Article 210** - Branch Circuits
- **Article 215** - Feeders
- **Article 220** - Branch-Circuit, Feeder, and Service Load Calculations
- **Article 230** - Services
- **Article 250** - Grounding and Bonding
- **Article 310** - Conductors for General Wiring
- **Article 314** - Outlet, Device, Pull, and Junction Boxes
- **Article 430** - Motors, Motor Circuits, and Controllers
- **Chapter 9** - Tables (Conduit Fill, Conductor Properties)

### Data Sources

The application includes comprehensive reference data:

- **wireData.js** - Conductor properties (ampacity, resistance, area)
- **conduitData.js** - Conduit fill tables for EMT, IMC, RMC
- **boxFillData.js** - Junction box volume requirements
- **Lighting calculations** - Fixture and load data
- **Reactance/Impedance tables** - Advanced calculations

---

## 🏗 Project Structure

```
electrician-toolkit/
├── src/
│   ├── features/
│   │   ├── calculators/          # 20+ electrical calculators
│   │   │   ├── AmpacityLookupCalculator.jsx
│   │   │   ├── BoxFillCalculator.jsx
│   │   │   ├── ConduitBendingCalculator.jsx
│   │   │   ├── ConduitFillCalculator.jsx
│   │   │   ├── EVChargingCalculator.jsx
│   │   │   ├── GroundingBondingCalculator.jsx
│   │   │   ├── LoadCalculations.jsx
│   │   │   ├── MotorCalculations.jsx
│   │   │   ├── NeutralSizingCalculator.jsx
│   │   │   ├── OhmsLawBasic.jsx
│   │   │   ├── OhmsLawCalculator.jsx
│   │   │   ├── OhmsLawParallel.jsx
│   │   │   ├── OhmsLawSeries.jsx
│   │   │   ├── OverheadClearanceCalculator.jsx
│   │   │   ├── PowerFactorCorrection.jsx
│   │   │   ├── PowerTriangleCalculator.jsx
│   │   │   ├── PullBoxCalculator.jsx
│   │   │   ├── ReceptacleCalculator.jsx
│   │   │   ├── ServiceEntranceSizing.jsx
│   │   │   ├── SolarPVCalculator.jsx
│   │   │   ├── ThreePhasePowerCalculator.jsx
│   │   │   ├── TransformerSizingCalculator.jsx
│   │   │   ├── UndergroundDepthCalculator.jsx
│   │   │   ├── VFDSizingCalculator.jsx
│   │   │   ├── VoltageDropCalculator.jsx
│   │   │   ├── WorkingSpaceCalculator.jsx
│   │   │   ├── ReactanceImpedance/
│   │   │   ├── data/              # NEC reference data
│   │   │   │   ├── boxFillData.js
│   │   │   │   ├── conduitData.js
│   │   │   │   └── wireData.js
│   │   │   ├── lighting/          # Lighting calculations
│   │   │   └── CalculatorMenu.jsx
│   │   ├── estimates/             # Estimating system
│   │   │   ├── Estimates.jsx
│   │   │   └── estimatesService.js
│   │   ├── invoices/              # Invoice management
│   │   │   └── Invoices.jsx
│   │   ├── jobs/                  # Job tracking
│   │   │   ├── Jobs.jsx
│   │   │   ├── JobCard.jsx
│   │   │   ├── JobForm.jsx
│   │   │   ├── JobModal.jsx
│   │   │   ├── StatusTabs.jsx
│   │   │   ├── EstimateSelector.jsx
│   │   │   └── jobsService.js
│   │   ├── profile/               # User profile
│   │   │   ├── Profile.jsx
│   │   │   └── AuthModal.jsx
│   │   └── home/                  # Dashboard
│   │       └── Home.jsx
│   ├── App.jsx
│   ├── index.js
│   └── firebase.js                # Firebase configuration
├── public/
├── package.json
├── vite.config.js
└── README.md
```

---

## 🎯 Target Users

### Primary Audience
- **Licensed Electricians** running side work or small businesses
- **Electrical Contractors** needing mobile job management
- **Apprentice Electricians** learning calculations and code
- **Electrical Estimators** preparing quick quotes

### Use Cases
- **Field Calculations** - Quick, accurate calculations on job sites
- **Job Bidding** - Professional estimates for client proposals
- **Business Management** - Track jobs from estimate to invoice
- **Code Compliance** - Quick NEC reference and verification
- **Training Tool** - Learn electrical calculations and code requirements

### Development Guidelines

**Code Standards**
- Use React functional components with hooks
- Follow mobile-first CSS approach
- Include PropTypes or TypeScript for type safety
- Write unit tests for calculations
- Document complex calculations with comments

**Calculator Requirements**
- Include NEC article references
- Add input validation and error handling
- Provide clear warnings for code violations
- Support both imperial and metric units (where applicable)
- Test with real-world scenarios

**UI/UX Guidelines**
- Touch-friendly buttons (minimum 44x44px)
- High contrast for outdoor visibility
- Clear error messages
- Loading states for async operations
- Responsive design for all screen sizes

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ⚠️ Disclaimer

**Important Legal Notice**

This tool is designed to assist with electrical calculations but should not replace professional judgment, engineering analysis, or local code requirements. Users must:

- Verify all calculations independently
- Consult current National Electrical Code (NEC) standards
- Follow local electrical codes and amendments
- Obtain proper permits and inspections
- Work within the scope of their electrical license

The developers assume no liability for:
- Calculation errors or omissions
- Code compliance issues
- Property damage or personal injury
- Financial losses from business use
- Any other damages arising from use of this software

**Always consult with a licensed electrician or electrical engineer for critical installations.**

---

## 📊 Project Status

**Current Version**: 0.1.0 (Beta)
**Status**: Active Development
**Last Updated**: October 2024
**Target Launch**: Christmas 2024

### Statistics
- 20+ Professional Calculators
- 4 Major Business Features
- Mobile-First Progressive Web App
- Firebase Backend Integration
- Active Development

---

**Built with ⚡ by an electrician, for electricians**

