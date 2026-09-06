export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ProjectStatus =
  | "ONGOING"
  | "COMPLETED"
  | "DELAYED"
  | "UNDER_REVIEW";

export interface Project {
  id: string;
  name: string;
  district: string;
  state: string;
  category: string;

  sanctionedAmount: number;
  expenditure: number;

  progress: number;
  expectedProgress: number;

  status: ProjectStatus;

  riskScore: number;
  riskLevel: RiskLevel;

  anomaly: string;
  daysDelayed: number;

  implementingAgency: string;

  sanctionDate: string;
  expectedCompletion: string;
}