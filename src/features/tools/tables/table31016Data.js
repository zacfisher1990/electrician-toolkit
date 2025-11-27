// Table 310.16 - Allowable Ampacities of Insulated Conductors
// This is a simplified representation based on NEC Table 310.16 structure

export const table31016Data = {
  title: "Table 310.16",
  subtitle: "Allowable Ampacities of Insulated Conductors Rated 0 Through 2000 Volts, 60°C Through 90°C",
  description: "Not More Than Three Current-Carrying Conductors in Raceway, Cable, or Earth (Directly Buried), Based on Ambient Temperature of 30°C (86°F)",
  
  headers: [
    // First header row - Temperature ratings
    [
      { content: "", rowspan: 2 },
      { content: "Temperature Rating of Conductor (See Table 310.13)", colspan: 6 },
      { content: "", rowspan: 2 }
    ],
    // Second header row - Specific temperatures and wire types
    [
      { content: "60°C (140°F)", align: "center" },
      { content: "75°C (167°F)", align: "center" },
      { content: "90°C (194°F)", align: "center" },
      { content: "60°C (140°F)", align: "center" },
      { content: "75°C (167°F)", align: "center" },
      { content: "90°C (194°F)", align: "center" }
    ],
    // Third header row - Wire type details
    [
      { content: "Size mm² (AWG or kcmil)", align: "center" },
      { content: "Types TW, UF", align: "center" },
      { content: "Types RHW, THHW, THW, THWN, XHHW, USE, ZW", align: "center" },
      { content: "Types TBS, SA, SIS, FEP, FEPB, MI, RHH, RHW-2, THHN, THHW, THW-2, THWN-2, USE-2, XHH, XHHW, XHHW-2, ZW-2", align: "center" },
      { content: "Types TW, UF", align: "center" },
      { content: "Types RHW, THHW, THW, THWN, XHHW, USE, ZW", align: "center" },
      { content: "Types TBS, SA, SIS, FEP, FEPB, MI, RHH, RHW-2, THHN, THHW, THW-2, THWN-2, USE-2, XHH, XHHW, XHHW-2, ZW-2", align: "center" },
      { content: "Size mm² (AWG or kcmil)", align: "center" }
    ],
    // Fourth header row - Material type
    [
      { content: "", align: "center" },
      { content: "COPPER", colspan: 3, align: "center", bold: true },
      { content: "ALUMINUM OR COPPER-CLAD ALUMINUM", colspan: 3, align: "center", bold: true },
      { content: "", align: "center" }
    ]
  ],

  rows: [
    // Copper conductors
    [
      { content: "2.0(1.6)*" },
      { content: "20", align: "center" },
      { content: "20", align: "center" },
      { content: "25", align: "center" },
      { content: "—", align: "center" },
      { content: "—", align: "center" },
      { content: "—", align: "center" },
      { content: "2.0(1.6)*" }
    ],
    [
      { content: "3.5(2.0)*" },
      { content: "25", align: "center" },
      { content: "25", align: "center" },
      { content: "30", align: "center" },
      { content: "20", align: "center" },
      { content: "20", align: "center" },
      { content: "25", align: "center" },
      { content: "3.5(2.0)*" }
    ],
    [
      { content: "5.5(2.6)*" },
      { content: "30", align: "center" },
      { content: "35", align: "center" },
      { content: "40", align: "center" },
      { content: "25", align: "center" },
      { content: "30", align: "center" },
      { content: "35", align: "center" },
      { content: "5.5(2.6)*" }
    ],
    [
      { content: "8.0(3.2)" },
      { content: "40", align: "center" },
      { content: "50", align: "center" },
      { content: "55", align: "center" },
      { content: "30", align: "center" },
      { content: "40", align: "center" },
      { content: "45", align: "center" },
      { content: "8.0(3.2)" }
    ],
    [
      { content: "14" },
      { content: "55", align: "center" },
      { content: "65", align: "center" },
      { content: "70", align: "center" },
      { content: "40", align: "center" },
      { content: "50", align: "center" },
      { content: "60", align: "center" },
      { content: "14" }
    ],
    [
      { content: "22" },
      { content: "70", align: "center" },
      { content: "85", align: "center" },
      { content: "90", align: "center" },
      { content: "55", align: "center" },
      { content: "65", align: "center" },
      { content: "80", align: "center" },
      { content: "22" }
    ],
    [
      { content: "30" },
      { content: "90", align: "center" },
      { content: "110", align: "center" },
      { content: "115", align: "center" },
      { content: "65", align: "center" },
      { content: "80", align: "center" },
      { content: "90", align: "center" },
      { content: "30" }
    ],
    [
      { content: "38" },
      { content: "100", align: "center" },
      { content: "125", align: "center" },
      { content: "130", align: "center" },
      { content: "75", align: "center" },
      { content: "90", align: "center" },
      { content: "105", align: "center" },
      { content: "38" }
    ],
    [
      { content: "50" },
      { content: "120", align: "center" },
      { content: "145", align: "center" },
      { content: "150", align: "center" },
      { content: "95", align: "center" },
      { content: "110", align: "center" },
      { content: "125", align: "center" },
      { content: "50" }
    ],
    [
      { content: "60" },
      { content: "135", align: "center" },
      { content: "160", align: "center" },
      { content: "170", align: "center" },
      { content: "100", align: "center" },
      { content: "120", align: "center" },
      { content: "135", align: "center" },
      { content: "60" }
    ],
    [
      { content: "80" },
      { content: "160", align: "center" },
      { content: "195", align: "center" },
      { content: "205", align: "center" },
      { content: "120", align: "center" },
      { content: "145", align: "center" },
      { content: "165", align: "center" },
      { content: "80" }
    ],
    [
      { content: "100" },
      { content: "185", align: "center" },
      { content: "220", align: "center" },
      { content: "225", align: "center" },
      { content: "140", align: "center" },
      { content: "170", align: "center" },
      { content: "190", align: "center" },
      { content: "100" }
    ],
    [
      { content: "125" },
      { content: "210", align: "center" },
      { content: "255", align: "center" },
      { content: "265", align: "center" },
      { content: "165", align: "center" },
      { content: "200", align: "center" },
      { content: "225", align: "center" },
      { content: "125" }
    ],
    [
      { content: "150" },
      { content: "240", align: "center" },
      { content: "280", align: "center" },
      { content: "295", align: "center" },
      { content: "185", align: "center" },
      { content: "225", align: "center" },
      { content: "250", align: "center" },
      { content: "150" }
    ],
    [
      { content: "175" },
      { content: "260", align: "center" },
      { content: "305", align: "center" },
      { content: "345", align: "center" },
      { content: "205", align: "center" },
      { content: "245", align: "center" },
      { content: "275", align: "center" },
      { content: "175" }
    ],
    [
      { content: "200" },
      { content: "280", align: "center" },
      { content: "330", align: "center" },
      { content: "355", align: "center" },
      { content: "220", align: "center" },
      { content: "265", align: "center" },
      { content: "300", align: "center" },
      { content: "200" }
    ],
    [
      { content: "250" },
      { content: "315", align: "center" },
      { content: "375", align: "center" },
      { content: "400", align: "center" },
      { content: "255", align: "center" },
      { content: "305", align: "center" },
      { content: "345", align: "center" },
      { content: "250" }
    ]
  ],

  notes: [
    "* Conductor sizes 2.0(1.6), 3.5(2.0), and 5.5(2.6) are metric designations.",
    "Correction factors shall be applied when the ambient temperature differs from 30°C (86°F). See 310.15(B)(2)(a).",
    "For more than three current-carrying conductors, apply adjustment factors from Table 310.15(C)(1)."
  ]
};