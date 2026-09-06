import type { Project } from "../types";

export const projects: Project[] = [
  {
    id: "MP-20481",
    name: "Construction of Community Hall",
    district: "Aurangabad",
    state: "Maharashtra",
    category: "Community Infrastructure",

    sanctionedAmount: 2480000,
    expenditure: 2310000,

    progress: 67,
    expectedProgress: 91,

    status: "DELAYED",

    riskScore: 91,
    riskLevel: "CRITICAL",

    anomaly: "High expenditure compared with physical progress",
    daysDelayed: 112,

    implementingAgency: "District Development Authority",

    sanctionDate: "2025-11-18",
    expectedCompletion: "2026-05-30",
  },

  {
    id: "MP-19372",
    name: "Rural Road Development",
    district: "Nashik",
    state: "Maharashtra",
    category: "Road Infrastructure",

    sanctionedAmount: 1850000,
    expenditure: 1720000,

    progress: 54,
    expectedProgress: 82,

    status: "DELAYED",

    riskScore: 87,
    riskLevel: "HIGH",

    anomaly: "Expenditure-progress mismatch",
    daysDelayed: 76,

    implementingAgency: "Rural Development Agency",

    sanctionDate: "2025-12-02",
    expectedCompletion: "2026-06-15",
  },

  {
    id: "MP-21104",
    name: "Community Infrastructure Development",
    district: "Pune",
    state: "Maharashtra",
    category: "Community Infrastructure",

    sanctionedAmount: 2200000,
    expenditure: 980000,

    progress: 42,
    expectedProgress: 49,

    status: "UNDER_REVIEW",

    riskScore: 82,
    riskLevel: "HIGH",

    anomaly: "Possible duplicate work detected",
    daysDelayed: 31,

    implementingAgency: "Municipal Development Authority",

    sanctionDate: "2026-01-10",
    expectedCompletion: "2026-08-15",
  },

  {
    id: "MP-18932",
    name: "Primary School Infrastructure Upgrade",
    district: "Nagpur",
    state: "Maharashtra",
    category: "Education",

    sanctionedAmount: 3100000,
    expenditure: 2840000,

    progress: 73,
    expectedProgress: 86,

    status: "ONGOING",

    riskScore: 79,
    riskLevel: "HIGH",

    anomaly: "Unusual payment concentration",
    daysDelayed: 43,

    implementingAgency: "Education Infrastructure Board",

    sanctionDate: "2025-10-22",
    expectedCompletion: "2026-07-30",
  },

  {
    id: "MP-17641",
    name: "Village Water Supply System",
    district: "Kolhapur",
    state: "Maharashtra",
    category: "Water Supply",

    sanctionedAmount: 1450000,
    expenditure: 830000,

    progress: 58,
    expectedProgress: 61,

    status: "ONGOING",

    riskScore: 48,
    riskLevel: "MEDIUM",

    anomaly: "Minor timeline deviation",
    daysDelayed: 14,

    implementingAgency: "Water Supply Department",

    sanctionDate: "2026-01-18",
    expectedCompletion: "2026-09-10",
  },

  {
    id: "MP-16520",
    name: "Public Health Centre Renovation",
    district: "Satara",
    state: "Maharashtra",
    category: "Healthcare",

    sanctionedAmount: 2800000,
    expenditure: 1950000,

    progress: 72,
    expectedProgress: 70,

    status: "ONGOING",

    riskScore: 23,
    riskLevel: "LOW",

    anomaly: "No significant anomaly detected",
    daysDelayed: 0,

    implementingAgency: "District Health Authority",

    sanctionDate: "2026-02-05",
    expectedCompletion: "2026-09-25",
  },
];