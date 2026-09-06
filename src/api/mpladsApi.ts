const API_BASE = "/api";

/* =========================================================
   STATE SUMMARY
========================================================= */

export interface StateSummary {
  state: string;

  totalAllocated: number;
  totalExpenditure: number;
  totalRecommendedAmount: number;

  utilizationPercentage: number;
  expenditurePercentage: number;

  utilizationDefinition: string;

  mpCount: number;
  totalMPs: number;

  totalWorksCompleted: number;
  completedWorksCount: number;

  recommendedWorksCount: number;
}

interface StatesResponse {
  success: boolean;
  data: StateSummary[];
}

/* =========================================================
   MP DETAILS
========================================================= */

export interface MPDetails {
  name: string;
  name_hi?: string;
  constituency: string;
  party: string;
}

/* =========================================================
   COMPLETED WORK
========================================================= */

export interface CompletedWork {
  id: string;

  state: string;

  work_id: number;

  work_description: string;
  work_description_hi?: string;

  category: string;
  category_hi?: string;

  cost: number;

  completion_date: string;
  completion_year: number;

  location: string;
  location_hi?: string;

  district: string;
  district_hi?: string;

  state_hi?: string;

  beneficiaries: number;

  mp_details: MPDetails;
}

/* =========================================================
   COMPLETED WORKS RESPONSE
========================================================= */

interface CompletedWorksResponse {
  success: boolean;

  data?: {
    completedWorks?: CompletedWork[];
  };
}

/* =========================================================
   GET STATE SUMMARIES
========================================================= */

export async function getStateSummaries(): Promise<StateSummary[]> {
  const response = await fetch(
    `${API_BASE}/summary/states?limit=50`,
  );

  if (!response.ok) {
    throw new Error(
      `MPLADS API error: ${response.status}`,
    );
  }

  const result: StatesResponse = await response.json();

  if (!result.success) {
    throw new Error(
      "MPLADS API returned an unsuccessful response.",
    );
  }

  if (!Array.isArray(result.data)) {
    throw new Error(
      "Invalid state summary response from MPLADS API.",
    );
  }

  return result.data;
}

/* =========================================================
   GET COMPLETED WORKS
========================================================= */

export async function getCompletedWorks(
  state: string,
  page = 1,
  limit = 20,
): Promise<CompletedWork[]> {
  const params = new URLSearchParams();

  params.set("page", String(page));
  params.set("limit", String(limit));
  params.set("state", state);

  const url = `${API_BASE}/works/completed?${params.toString()}`;

  console.log("MPLADS COMPLETED WORKS REQUEST:", url);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Completed works API error: ${response.status}`,
    );
  }

  const result: CompletedWorksResponse =
    await response.json();

  console.log(
    "MPLADS COMPLETED WORKS RESPONSE:",
    result,
  );

  if (!result.success) {
    throw new Error(
      "Completed works API returned an unsuccessful response.",
    );
  }

  /*
   * IMPORTANT:
   *
   * API response is:
   *
   * {
   *   success: true,
   *   data: {
   *      completedWorks: [...]
   *   }
   * }
   *
   * So we extract completedWorks here.
   */

  const completedWorks =
    result.data?.completedWorks;

  /*
   * Never allow a non-array value to reach the UI.
   */

  if (!Array.isArray(completedWorks)) {
    console.warn(
      "MPLADS API did not return a completedWorks array.",
      result,
    );

    return [];
  }

  return completedWorks;
}