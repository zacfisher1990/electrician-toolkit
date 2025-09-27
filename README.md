# Electrician Toolkit

A comprehensive web application providing professional electrical calculations for electricians, following current NEC standards. Designed for use in the field with mobile-responsive interface.

## Features

### Core Calculators
- **Voltage Drop Calculator** - Single/3-phase with copper/aluminum conductors, power factor correction
- **Ohm's Law & Circuit Analysis** - Basic calculations plus series/parallel circuit analysis
- **Motor Calculations** - Full load current (NEC Table 430.250), branch circuit protection, wire sizing
- **Conduit Fill Calculator** - NEC-compliant conduit fill percentages
- **Box Fill Calculator** - Junction box volume calculations
- **Wire Size Calculator** - Conductor sizing for various applications
- **Ampacity Lookup** - Quick reference for conductor ampacity ratings

### Technical Features
- Mobile-first responsive design
- NEC-compliant calculations and references
- Professional tabbed interface for complex calculators
- Real-time calculation updates
- Touch-friendly interface optimized for job site use

## Live Demo

Visit the live application: (https://sprightly-melba-ff3436.netlify.app/)

## Technology Stack

- **Frontend**: React 18
- **Build Tool**: Vite
- **Styling**: CSS3 with mobile-responsive design
- **Deployment**: Netlify with automatic GitHub integration
- **Development Environment**: Chromebook with Linux (Crostini)

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
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view in browser

### Building for Production

```bash
npm run build
```

## Usage

The application is designed for electricians working in residential, commercial, and industrial settings. Each calculator includes:

- Input validation and error handling
- NEC code references where applicable
- Mobile-optimized interface for field use
- Clear results with relevant warnings (e.g., voltage drop exceeding 3%)

## NEC Compliance

All calculations follow current National Electrical Code (NEC) standards including:
- Article 430: Motors, Motor Circuits, and Controllers
- Chapter 9: Tables for conduit and conductor sizing
- Article 310: Conductors for General Wiring

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-calculator`)
3. Commit your changes (`git commit -am 'Add new calculator'`)
4. Push to the branch (`git push origin feature/new-calculator`)
5. Open a Pull Request

## Development Notes

- Built using React functional components with hooks
- Mobile-first CSS approach with responsive breakpoints
- Consistent tabbed interface pattern for complex calculators
- Automatic deployment via Netlify on GitHub push

## License

This project is open source and available under the [MIT License](LICENSE).

## Disclaimer

This tool is designed to assist with electrical calculations but should not replace professional judgment or local code requirements. Always verify calculations and consult current NEC and local electrical codes before making electrical installations.