// Table 314.16(B) - Volume Allowance Required per Conductor
// Copyright-safe version using factual data with original descriptions

export const table31416BData = {
  title: "Table 314.16(B)",
  subtitle: "Box Fill Volume Requirements",
  description: "Minimum free space required within box for each conductor. Reference only - consult current NEC for complete requirements and conditions.",
  
  disclaimer: "Quick reference tool. Always verify with current NEC code book. Does not replace professional judgment or official code compliance requirements.",
  
  headers: [
    [
      { content: "Conductor Size (AWG)", align: "center" },
      { content: "Free Space Within Box", align: "center" }
    ]
  ],

  rows: [
    [
      { content: "18", align: "center" },
      { content: "1.50 in³ (24.6 cm³)", align: "center" }
    ],
    [
      { content: "16", align: "center" },
      { content: "1.75 in³ (28.7 cm³)", align: "center" }
    ],
    [
      { content: "14", align: "center" },
      { content: "2.00 in³ (32.8 cm³)", align: "center" }
    ],
    [
      { content: "12", align: "center" },
      { content: "2.25 in³ (36.9 cm³)", align: "center" }
    ],
    [
      { content: "10", align: "center" },
      { content: "2.50 in³ (41.0 cm³)", align: "center" }
    ],
    [
      { content: "8", align: "center" },
      { content: "3.00 in³ (49.2 cm³)", align: "center" }
    ],
    [
      { content: "6", align: "center" },
      { content: "5.00 in³ (81.9 cm³)", align: "center" }
    ]
  ],

  notes: [
    "Each conductor originating outside the box and terminating inside counts as one conductor",
    "Each conductor passing through the box without splice or termination counts as one conductor",
    "Each conductor looped and unbroken within the box counts as two conductors",
    "Equipment grounding conductors count as one conductor based on largest size present",
    "Cable clamps, fixture studs, and device yokes count per NEC 314.16(B)(2-4)",
    "Refer to NEC Article 314.16 for complete box fill calculation requirements"
  ]
};