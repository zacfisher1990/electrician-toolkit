# Electrician Toolkit

A comprehensive web application providing professional electrical calculations for electricians and electrical engineers, following current NEC standards. Designed for use in the field with a mobile-responsive interface and dark mode support.

## Features

### Core Calculators

#### Basic Electrical Calculations
- **Voltage Drop Calculator** - Calculate voltage drop for single/3-phase systems with copper/aluminum conductors and power factor correction
- **Ohm's Law & Circuit Analysis** - Basic V, I, R, P calculations plus advanced series/parallel circuit solver
- **Reactance & Impedance Calculator** - Calculate inductive reactance (XL), capacitive reactance (XC), impedance (Z), and resonant frequency for AC circuits
- **Power Factor Correction** - Size capacitor banks for power factor improvement and calculate cost savings with ROI analysis

#### Motor & Drive Systems
- **Motor Calculations** - Full load current (NEC Table 430.250), branch circuit protection, and wire sizing per NEC Article 430
- **VFD Sizing Calculator** - Variable frequency drive selection with derating factors for altitude, temperature, and duty cycle

#### Wire & Conduit
- **Conduit Fill Calculator** - NEC Chapter 9 compliant conduit fill calculations for EMT, PVC, and Rigid conduit
- **Box Fill Calculator** - Junction box volume calculations per NEC Article 314
- **Ampacity Lookup** - Quick reference for conductor ampacity ratings per NEC Table 310.15(B)(16)

#### Service & Distribution
- **Service Entrance Sizing** - Residential and commercial service calculations per NEC Article 230
- **Load Calculations** - Comprehensive load analysis for panel and service sizing
- **Transformer Sizing Calculator** - Calculate transformer size and primary/secondary currents per NEC Article 450

#### Grounding & Safety
- **Grounding & Bonding Calculator** - Size grounding electrode conductors, equipment grounding conductors, and bonding jumpers per NEC Article 250

#### Construction & Layout
- **Conduit Bending Calculator** - Calculate bending measurements for offsets, saddles, and stub-ups
- **Lighting Calculator** - Lumens, foot-candles, fixture spacing, and illumination calculations

### Technical Features
- **Dark Mode Support** - Easy on the eyes for evening work or field use
- **Mobile-First Responsive Design** - Optimized for smartphones and tablets
- **NEC-Compliant Calculations** - All calculations reference current NEC articles and tables
- **Professional Tabbed Interface** - Complex calculators organized with intuitive tab navigation
- **Real-Time Calculations** - Instant results as you enter values
- **Touch-Friendly Interface** - Large buttons and inputs optimized for job site use
- **Search Functionality** - Quickly find the calculator you need
- **Consistent Design System** - Clean, professional UI across all calculators

## Live Demo

Visit the live application: [https://zacfisher1990.github.io/electrician-toolkit/](https://zacfisher1990.github.io/electrician-toolkit/)

## Technology Stack

- **Frontend**: React 18 with Hooks
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Styling**: Inline CSS with consistent design system
- **Deployment**: GitHub Pages with automatic deployment
- **Development Environment**: Windows Desktop and Chromebook with Linux (Crostini)

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/zacfisher1990/electrician-toolkit.git
cd electrician-toolkit
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) to view in browser (Vite default port)

### Building for Production

```bash
npm run build
```

The build output will be in the `dist` folder.

## Usage

The application is designed for electricians and electrical engineers working in residential, commercial, and industrial settings. Each calculator includes:

- **Input Validation** - Prevents invalid entries and provides helpful feedback
- **NEC Code References** - Citations to relevant NEC articles and tables
- **Mobile-Optimized Interface** - Easy to use on phones and tablets in the field
- **Clear Results** - Large, readable results with relevant warnings
- **Unit Conversions** - Automatic handling of common electrical units
- **Professional Output** - Results formatted for documentation and reporting

### Example Use Cases

- **In the Field**: Calculate voltage drop for long wire runs, size conduit for cable pulls
- **Design Work**: Size services, transformers, and motor circuits
- **Cost Analysis**: Calculate power factor correction savings and payback periods
- **Code Compliance**: Verify box fill, conduit fill, and grounding conductor sizes
- **Learning**: Study electrical principles with interactive calculations

## NEC Compliance

All calculations follow current National Electrical Code (NEC) standards including:

- **Article 220**: Branch-Circuit, Feeder, and Service Load Calculations
- **Article 230**: Services
- **Article 250**: Grounding and Bonding
- **Article 310**: Conductors for General Wiring
- **Article 314**: Outlet, Device, Pull, and Junction Boxes
- **Article 430**: Motors, Motor Circuits, and Controllers
- **Article 450**: Transformers and Transformer Vaults
- **Chapter 9**: Tables for conduit and conductor sizing

## Calculator Details

### Power Factor Correction
Includes two comprehensive tabs:
- **Capacitor Sizing**: Calculate required kVAR and microfarads
- **Cost Savings**: ROI analysis with demand charge savings and payback period

### Reactance & Impedance
Four specialized calculators:
- **Inductive Reactance (XL)**: Calculate reactance of inductors
- **Capacitive Reactance (XC)**: Calculate reactance of capacitors
- **Impedance (Z)**: Calculate total impedance and phase angle
- **Resonant Frequency**: Find resonance point in LC circuits

### Motor Calculations
Three integrated tools:
- **Full Load Current**: Direct NEC table lookup or calculated values
- **Circuit Protection**: Size overload protection per NEC 430.52
- **Wire Sizing**: Size branch circuit conductors at 125% of FLC


### Development Guidelines
- Follow the established design system (card-based layout, consistent colors)
- Use functional components with React hooks
- Maintain mobile-first responsive design
- Include NEC references where applicable
- Add comprehensive input validation
- Test calculations against known values

## Roadmap

Potential future enhancements:
- **Three-Phase Power Calculator** - Comprehensive 3-phase calculations
- **Short Circuit Current** - Fault current calculations
- **Arc Flash Calculator** - Basic incident energy calculations
- **Panel Schedule Builder** - Interactive panel schedule creation
- **Wire Pull Tension** - Calculate pulling tension and sidewall pressure
- **Energy Cost Calculator** - Operating cost analysis
- **PDF Export** - Generate calculation reports

## Development Notes

- Built using React functional components with hooks (useState, useEffect)
- Consistent design system with dark mode support throughout
- Mobile-first CSS approach with responsive breakpoints at 800px max-width
- Modular component structure for easy maintenance
- Automatic deployment via GitHub Pages on push to main branch
- All calculators follow the same design pattern for consistency

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- National Fire Protection Association (NFPA) for the National Electrical Code
- Lucide for the excellent icon library
- The electrical engineering community for formulas and best practices

## Disclaimer

This tool is designed to assist with electrical calculations but should not replace professional judgment or local code requirements. Always verify calculations and consult current NEC and local electrical codes before making electrical installations. The developers assume no liability for the accuracy of calculations or their application in real-world scenarios.

## Contact

For questions, suggestions, or bug reports, please open an issue on GitHub.

---

**Made by an electrician for electricians ⚡**