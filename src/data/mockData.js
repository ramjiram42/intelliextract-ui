export const DOCUMENT_CLASSES = [
  "Accident Report",
  "Attachments",
  "Bill of Lading (BOL)",
  "CA Rental Agreement",
  "Condition Report",
  "Manual Rental Agreement",
  "Preventative Maintenance",
  "Registration",
  "Shuttle Ticket",
  "Shop Repair Order (SRO)",
  "Thermal",
  "Tow Ticket",
  "Vehicle Damage Appraisal (VDA)",
  "Vehicle Damage Appraisal Invoice (VDA Invoice)",
  "Vehicle Maintenance History File (VHMF)"
];

export const STATUS_LIST = [
  "Action Required",
  "Verified",
  "Pending",
  "In Progress",
  "Invalid"
];

export const INITIAL_FILES = [
  {
    id: 1,
    name: '20260323_120938_multiple pages 2.pdf',
    docClass: 'Condition Report',
    totalVin: 56,
    pages: 14,
    found: 0,
    needManual: 56,
    accuracy: 0,
    status: 'Action Required',
    processingTime: '2.14s',
    confidence: '68.2%',
    fileSize: '4.8 MB',
    fileNetStatus: 'Needs Review',
    fileNetId: 'FN-20260323-90412',
    account: 'HERTZ VEHICLES LLC',
    location: 'ATL - Hartsfield Fleet Ops',
    extractedVins: [
      { id: 'e-1', vin: '5XYRL4JC0RG270559', page: 1, mileage: '18,420', area: 'Zone A', unit: 'H-4019', confidence: 99.1, make: 'Kia', model: 'Sorento', year: 2024, bbox: { x: 60, y: 28, w: 28, h: 3.5 } },
      { id: 'e-2', vin: 'KL77LHEP8SC231401', page: 1, mileage: '22,100', area: 'Zone B', unit: 'H-5102', confidence: 98.7, make: 'Chevrolet', model: 'Trax', year: 2025, bbox: { x: 60, y: 36, w: 28, h: 3.5 } },
      { id: 'e-3', vin: '5NMP24GL2SH130350', page: 1, mileage: '9,850', area: 'Zone C', unit: 'H-3841', confidence: 99.5, make: 'Nissan', model: 'Rogue', year: 2025, bbox: { x: 60, y: 44, w: 28, h: 3.5 } }
    ],
    manualVins: [
      { id: 'm-1', vin: '3C6UR5DJXTG234631', page: 2, mileage: '14,300', area: 'Zone A', unit: 'H-8821', errorReason: 'Check digit mismatch at pos 9', confidence: 71.4, resolved: false, make: 'Ram', model: '2500', year: 2026, bbox: { x: 60, y: 55, w: 28, h: 3.5 } },
      { id: 'm-2', vin: '3C6UR5DJ8TG234594', page: 2, mileage: '31,200', area: 'Zone D', unit: 'H-8822', errorReason: 'Uncertain character at position 10', confidence: 64.8, resolved: false, make: 'Ram', model: '2500', year: 2026, bbox: { x: 60, y: 63, w: 28, h: 3.5 } }
    ]
  },
  {
    id: 2,
    name: '20260323_120909_BOL YB 1_20 41units.pdf',
    docClass: 'Bill of Lading (BOL)',
    totalVin: 41,
    pages: 4,
    found: 0,
    needManual: 41,
    accuracy: 0,
    status: 'Action Required',
    processingTime: '1.82s',
    confidence: '74.5%',
    fileSize: '3.2 MB',
    fileNetStatus: 'Needs Review',
    fileNetId: 'FN-20260323-90388',
    account: 'HERTZ CAR DISTRIBUTION',
    location: 'ORD - Chicago Transit Hub',
    extractedVins: [
      { id: 'e-201', vin: '1FA6P8CF5R5140291', page: 1, mileage: '4,210', area: 'Bay 12', unit: 'TRK-01', confidence: 99.4, make: 'Ford', model: 'Mustang', year: 2024, bbox: { x: 58, y: 30, w: 30, h: 3.5 } },
      { id: 'e-202', vin: '2C3CDXBG8RH109482', page: 1, mileage: '11,400', area: 'Bay 12', unit: 'TRK-02', confidence: 98.9, make: 'Dodge', model: 'Charger', year: 2024, bbox: { x: 58, y: 38, w: 30, h: 3.5 } }
    ],
    manualVins: [
      { id: 'm-201', vin: '1G1YY2D75R5102938', page: 2, mileage: '8,190', area: 'Bay 14', unit: 'TRK-05', errorReason: 'Barcode tear across characters 11-14', confidence: 66.0, resolved: false, make: 'Chevrolet', model: 'Corvette', year: 2024, bbox: { x: 58, y: 52, w: 30, h: 3.5 } }
    ]
  },
  {
    id: 3,
    name: '20260323_115419_DOC001.pdf',
    docClass: 'Accident Report',
    totalVin: 5,
    pages: 1,
    found: 0,
    needManual: 5,
    accuracy: 0,
    status: 'Action Required',
    processingTime: '0.94s',
    confidence: '61.8%',
    fileSize: '1.1 MB',
    fileNetStatus: 'Needs Review',
    fileNetId: 'FN-20260323-89912',
    account: 'HERTZ FLEET CLAIMS',
    location: 'DFW - Dallas Hub',
    extractedVins: [],
    manualVins: [
      { id: 'm-301', vin: 'WAUZZZF27RA048192', page: 1, mileage: '42,100', area: 'Claims Pen', unit: 'CLM-901', errorReason: 'Low resolution scan (150 DPI)', confidence: 58.2, resolved: false, make: 'Audi', model: 'A5', year: 2024, bbox: { x: 55, y: 40, w: 32, h: 4 } }
    ]
  },
  {
    id: 4,
    name: '20260320_182122_HERTZ_00009370UT.pdf',
    docClass: 'CA Rental Agreement',
    totalVin: 2,
    pages: 1,
    found: 2,
    needManual: 0,
    accuracy: 100,
    status: 'Verified',
    processingTime: '0.62s',
    confidence: '99.8%',
    fileSize: '840 KB',
    fileNetStatus: 'Synced',
    fileNetId: 'FN-20260320-74910',
    account: 'HERTZ VEHICLES LLC',
    location: 'LAX - Los Angeles Airport',
    extractedVins: [
      { id: 'e-401', vin: '1FTFW1ED4NFA19024', page: 1, mileage: '12,980', area: 'Rental Row 4', unit: 'HZ-190', confidence: 99.9, make: 'Ford', model: 'F-150', year: 2023, bbox: { x: 58, y: 32, w: 30, h: 3.5 } },
      { id: 'e-402', vin: 'JN1AZ4EH9PM510294', page: 1, mileage: '16,400', area: 'Rental Row 5', unit: 'HZ-191', confidence: 99.7, make: 'Nissan', model: 'Armada', year: 2023, bbox: { x: 58, y: 45, w: 30, h: 3.5 } }
    ],
    manualVins: []
  },
  {
    id: 5,
    name: '20260320_182047_HERTZ_00009369CA.pdf',
    docClass: 'Vehicle Damage Appraisal (VDA)',
    totalVin: 9,
    pages: 1,
    found: 3,
    needManual: 6,
    accuracy: 33,
    status: 'Action Required',
    processingTime: '1.15s',
    confidence: '82.0%',
    fileSize: '2.1 MB',
    fileNetStatus: 'Needs Review',
    fileNetId: 'FN-20260320-74902',
    account: 'HERTZ APPRAISAL SVCS',
    location: 'SFO - San Francisco Intl',
    extractedVins: [
      { id: 'e-501', vin: '3KPF24AD3RE109284', page: 1, mileage: '28,100', area: 'Body Shop', unit: 'BS-09', confidence: 99.2, make: 'Kia', model: 'Forte', year: 2024, bbox: { x: 56, y: 25, w: 30, h: 3.5 } },
      { id: 'e-502', vin: 'KM8K12AA8RU401923', page: 1, mileage: '33,020', area: 'Body Shop', unit: 'BS-10', confidence: 98.4, make: 'Hyundai', model: 'Kona', year: 2024, bbox: { x: 56, y: 33, w: 30, h: 3.5 } },
      { id: 'e-503', vin: 'SALWR2V42NA710294', page: 1, mileage: '19,450', area: 'Body Shop', unit: 'BS-11', confidence: 99.0, make: 'Land Rover', model: 'Range Rover', year: 2022, bbox: { x: 56, y: 41, w: 30, h: 3.5 } }
    ],
    manualVins: [
      { id: 'm-501', vin: '1C4HJXDG2NW104928', page: 1, mileage: '15,200', area: 'Paint Bay', unit: 'BS-12', errorReason: 'Check digit validation failed', confidence: 73.1, resolved: false, make: 'Jeep', model: 'Wrangler', year: 2022, bbox: { x: 56, y: 55, w: 30, h: 3.5 } },
      { id: 'm-502', vin: '5TDDZRFH6SS091823', page: 1, mileage: '24,600', area: 'Paint Bay', unit: 'BS-13', errorReason: 'Handwritten notes overlapping VIN barcode', confidence: 69.5, resolved: false, make: 'Toyota', model: 'Highlander', year: 2025, bbox: { x: 56, y: 64, w: 30, h: 3.5 } }
    ]
  },
  {
    id: 6,
    name: '20260320_145909_nj 03-18-26.pdf',
    docClass: 'Registration',
    totalVin: 44,
    pages: 3,
    found: 1,
    needManual: 43,
    accuracy: 2,
    status: 'Action Required',
    processingTime: '2.40s',
    confidence: '55.3%',
    fileSize: '3.6 MB',
    fileNetStatus: 'Needs Review',
    fileNetId: 'FN-20260320-68190',
    account: 'STATE DMV COMPLIANCE',
    location: 'EWR - Newark Station',
    extractedVins: [
      { id: 'e-601', vin: '2HGFC2F69NH501928', page: 1, mileage: '5,100', area: 'DMV Staging', unit: 'REG-01', confidence: 99.5, make: 'Honda', model: 'Civic', year: 2022, bbox: { x: 55, y: 30, w: 32, h: 3.5 } }
    ],
    manualVins: [
      { id: 'm-601', vin: '1N4AL3AP8NC391024', page: 1, mileage: '14,200', area: 'DMV Staging', unit: 'REG-02', errorReason: 'Low contrast watermark interference', confidence: 64.0, resolved: false, make: 'Nissan', model: 'Altima', year: 2022, bbox: { x: 55, y: 48, w: 32, h: 3.5 } }
    ]
  },
  {
    id: 7,
    name: '20260320_122426_Multiple pages.pdf',
    docClass: 'Shop Repair Order (SRO)',
    totalVin: 57,
    pages: 14,
    found: 32,
    needManual: 25,
    accuracy: 56,
    status: 'Action Required',
    processingTime: '3.10s',
    confidence: '84.2%',
    fileSize: '6.4 MB',
    fileNetStatus: 'Needs Review',
    fileNetId: 'FN-20260320-59102',
    account: 'HERTZ SERVICE CTR #42',
    location: 'MCO - Orlando Maintenance',
    extractedVins: [
      { id: 'e-701', vin: '3FA6P0HD9KR182049', page: 1, mileage: '38,190', area: 'Lift 3', unit: 'SRO-301', confidence: 99.2, make: 'Ford', model: 'Fusion', year: 2019, bbox: { x: 58, y: 28, w: 30, h: 3.5 } },
      { id: 'e-702', vin: '1G1ZE5ST8MF109283', page: 1, mileage: '41,200', area: 'Lift 4', unit: 'SRO-302', confidence: 98.8, make: 'Chevrolet', model: 'Malibu', year: 2021, bbox: { x: 58, y: 36, w: 30, h: 3.5 } }
    ],
    manualVins: [
      { id: 'm-701', vin: '2T1BURHE7KC102938', page: 2, mileage: '44,900', area: 'Oil Pit', unit: 'SRO-303', errorReason: 'Digit 7 obscured by oil smudge', confidence: 70.3, resolved: false, make: 'Toyota', model: 'Corolla', year: 2019, bbox: { x: 58, y: 55, w: 30, h: 3.5 } }
    ]
  },
  {
    id: 8,
    name: '20260321_102030_PENDING_DOC.pdf',
    docClass: 'Condition Report',
    totalVin: 12,
    pages: 3,
    found: 0,
    needManual: 12,
    accuracy: 0,
    status: 'Pending',
    processingTime: 'Queue #3',
    confidence: '--',
    fileSize: '1.9 MB',
    fileNetStatus: 'Pending',
    fileNetId: 'FN-20260321-81920',
    account: 'HERTZ FLEET RECEIVING',
    location: 'DEN - Denver Intake Hub',
    extractedVins: [],
    manualVins: []
  },
  {
    id: 9,
    name: '20260322_091522_INPROGRESS_DOC.pdf',
    docClass: 'Preventative Maintenance',
    totalVin: 5,
    pages: 2,
    found: 2,
    needManual: 3,
    accuracy: 40,
    status: 'In Progress',
    processingTime: '1.20s',
    confidence: '88.1%',
    fileSize: '1.4 MB',
    fileNetStatus: 'Pending',
    fileNetId: 'FN-20260322-90141',
    account: 'FLEET PM AUTOMATION',
    location: 'PHX - Phoenix Operations',
    extractedVins: [
      { id: 'e-901', vin: '4S4BRBFC5N3201928', page: 1, mileage: '15,000', area: 'Bay 1', unit: 'PM-101', confidence: 99.6, make: 'Subaru', model: 'Outback', year: 2022, bbox: { x: 57, y: 32, w: 30, h: 3.5 } }
    ],
    manualVins: [
      { id: 'm-901', vin: '3VW2B7AJ9NM401928', page: 1, mileage: '29,800', area: 'Bay 2', unit: 'PM-102', errorReason: 'OCR confidence 74% below 85% threshold', confidence: 74.2, resolved: false, make: 'Volkswagen', model: 'Jetta', year: 2022, bbox: { x: 57, y: 50, w: 30, h: 3.5 } }
    ]
  },
  {
    id: 10,
    name: '20260320_081010_INVALID_FILE.pdf',
    docClass: 'Thermal',
    totalVin: 0,
    pages: 1,
    found: 0,
    needManual: 0,
    accuracy: 0,
    status: 'Invalid',
    processingTime: '0.24s',
    confidence: '0.0%',
    fileSize: '120 KB',
    fileNetStatus: 'Rejected',
    fileNetId: 'FN-20260320-41002',
    account: 'UNCLASSIFIED OCR REJECT',
    location: 'System Quarantine',
    extractedVins: [],
    manualVins: []
  },
  {
    id: 11,
    name: '20260324_081433_VDA_INVOICE_6621.pdf',
    docClass: 'Vehicle Damage Appraisal Invoice (VDA Invoice)',
    totalVin: 18,
    pages: 3,
    found: 18,
    needManual: 0,
    accuracy: 100,
    status: 'Verified',
    processingTime: '1.10s',
    confidence: '99.4%',
    fileSize: '2.8 MB',
    fileNetStatus: 'Synced',
    fileNetId: 'FN-20260324-11829',
    account: 'HERTZ CLAIMS REIMBURSEMENT',
    location: 'MIA - Miami Fleet Terminal',
    extractedVins: [
      { id: 'e-1101', vin: '1FMCU0GD5PUB10293', page: 1, mileage: '12,400', area: 'Claims Rec', unit: 'INV-401', confidence: 99.8, make: 'Ford', model: 'Escape', year: 2023, bbox: { x: 58, y: 30, w: 30, h: 3.5 } },
      { id: 'e-1102', vin: '2HGFC1E34PH519203', page: 1, mileage: '18,900', area: 'Claims Rec', unit: 'INV-402', confidence: 99.7, make: 'Honda', model: 'Civic', year: 2023, bbox: { x: 58, y: 38, w: 30, h: 3.5 } }
    ],
    manualVins: []
  },
  {
    id: 12,
    name: '20260324_091102_VHMF_FLEET_AUDIT.pdf',
    docClass: 'Vehicle Maintenance History File (VHMF)',
    totalVin: 24,
    pages: 6,
    found: 22,
    needManual: 2,
    accuracy: 92,
    status: 'Action Required',
    processingTime: '2.05s',
    confidence: '94.6%',
    fileSize: '4.1 MB',
    fileNetStatus: 'Needs Review',
    fileNetId: 'FN-20260324-14920',
    account: 'HERTZ CORPORATE FLEET MGMT',
    location: 'BOS - Boston Logan Logistics',
    extractedVins: [
      { id: 'e-1201', vin: '1C4PJLCB8PD102948', page: 1, mileage: '33,200', area: 'Hist Bay', unit: 'VH-01', confidence: 99.3, make: 'Jeep', model: 'Cherokee', year: 2023, bbox: { x: 58, y: 32, w: 30, h: 3.5 } }
    ],
    manualVins: [
      { id: 'm-1201', vin: '5N1AL0MM4PC501924', page: 2, mileage: '48,100', area: 'Hist Bay', unit: 'VH-08', errorReason: 'Missing 1 character in serial sequence', confidence: 78.4, resolved: false, make: 'Nissan', model: 'Murano', year: 2023, bbox: { x: 58, y: 52, w: 30, h: 3.5 } }
    ]
  }
];

export const SYSTEM_STATS = {
  totalFiles: 361,
  actionRequired: 282,
  verifiedFiles: 64,
  pendingFiles: 11,
  inProgressFiles: 4,
  accuracyRate: 94.2,
  dailyThroughput: 1420,
  fileNetSyncRate: 99.8,
  avgProcessingTime: '1.24s'
};
