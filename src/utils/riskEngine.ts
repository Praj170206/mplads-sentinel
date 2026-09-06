import type { CompletedWork } from "../api/mpladsApi";

export type RiskLevel =
  | "CRITICAL"
  | "HIGH"
  | "MEDIUM"
  | "LOW";

export interface RiskIndicator {
  title: string;
  description: string;
  points: number;
  severity: "critical" | "high" | "medium" | "low";
}

export interface WorkRisk {
  work: CompletedWork;
  score: number;
  level: RiskLevel;
  indicators: RiskIndicator[];
  recommendation: string;
}

/*
 * MPLADS monitoring rules.
 *
 * These are explainable indicators, not claims of fraud.
 */

export function calculateWorkRisk(
  work: CompletedWork,
): WorkRisk {
  const indicators: RiskIndicator[] = [];

  const cost = Number(work.cost || 0);
  const beneficiaries = Number(
    work.beneficiaries || 0,
  );

  /* =====================================================
     1. MANDATORY PHYSICAL AUDIT THRESHOLD
  ===================================================== */

  if (cost >= 2500000) {
    indicators.push({
      title: "Mandatory Audit Threshold",
      description:
        "Work cost is ₹25 lakh or above and should be included in compulsory physical audit coverage.",
      points: 35,
      severity: "critical",
    });
  } else if (cost >= 1500000) {
    indicators.push({
      title: "Enhanced Audit Coverage",
      description:
        "Work cost falls within the ₹15–25 lakh band subject to enhanced physical-audit sampling.",
      points: 20,
      severity: "high",
    });
  }

  /* =====================================================
     2. ZERO BENEFICIARY DATA
  ===================================================== */

  if (beneficiaries === 0) {
    indicators.push({
      title: "Beneficiary Data Missing",
      description:
        "The public record reports zero beneficiaries. This should be verified against the work documentation.",
      points: 15,
      severity: "medium",
    });
  }

  /* =====================================================
     3. LOCATION DATA QUALITY
  ===================================================== */

  if (
    !work.location ||
    !work.district
  ) {
    indicators.push({
      title: "Incomplete Location Data",
      description:
        "District or location information is missing from the public record.",
      points: 15,
      severity: "medium",
    });
  }

  /* =====================================================
     4. COMPLETION DATE
  ===================================================== */

  if (!work.completion_date) {
    indicators.push({
      title: "Missing Completion Date",
      description:
        "The work does not contain a valid completion date in the returned record.",
      points: 20,
      severity: "high",
    });
  } else {
    const completionDate = new Date(
      work.completion_date,
    );

    if (Number.isNaN(completionDate.getTime())) {
      indicators.push({
        title: "Invalid Completion Date",
        description:
          "The completion date could not be interpreted as a valid date.",
        points: 20,
        severity: "high",
      });
    } else if (
      completionDate.getTime() >
      Date.now()
    ) {
      indicators.push({
        title: "Future Completion Date",
        description:
          "The recorded completion date is later than the current date and requires verification.",
        points: 40,
        severity: "critical",
      });
    }
  }

  /* =====================================================
     5. MISSING MP INFORMATION
  ===================================================== */

  if (
    !work.mp_details?.name ||
    !work.mp_details?.constituency
  ) {
    indicators.push({
      title: "Incomplete MP Mapping",
      description:
        "MP or constituency information is incomplete in the returned record.",
      points: 10,
      severity: "low",
    });
  }

  /* =====================================================
     SCORE
  ===================================================== */

  const rawScore = indicators.reduce(
    (sum, indicator) =>
      sum + indicator.points,
    0,
  );

  const score = Math.min(
    100,
    rawScore,
  );

  /* =====================================================
     RISK LEVEL
  ===================================================== */

  let level: RiskLevel;

  if (score >= 70) {
    level = "CRITICAL";
  } else if (score >= 45) {
    level = "HIGH";
  } else if (score >= 20) {
    level = "MEDIUM";
  } else {
    level = "LOW";
  }

  /* =====================================================
     RECOMMENDATION
  ===================================================== */

  let recommendation =
    "No immediate action. Continue routine monitoring.";

  if (level === "CRITICAL") {
    recommendation =
      "Prioritize physical verification and compliance review.";
  } else if (level === "HIGH") {
    recommendation =
      "Review supporting records and consider field verification.";
  } else if (level === "MEDIUM") {
    recommendation =
      "Verify flagged data fields during the next monitoring cycle.";
  }

  return {
    work,
    score,
    level,
    indicators,
    recommendation,
  };
}

/* =========================================================
   CALCULATE RISK FOR MULTIPLE WORKS
========================================================= */

export function calculateWorksRisk(
  works: CompletedWork[],
): WorkRisk[] {
  if (!Array.isArray(works)) {
    return [];
  }

  return works
    .map((work) =>
      calculateWorkRisk(work),
    )
    .sort(
      (a, b) =>
        b.score - a.score,
    );
}