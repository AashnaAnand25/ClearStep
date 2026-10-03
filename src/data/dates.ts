/** A date the user chose for themselves. Never presented as official. */
export interface UserReminder {
  kind: "user-reminder";
  date: string; // YYYY-MM-DD
}

/** An official deadline. Only shown when supplied with a source. */
export interface OfficialDeadline {
  kind: "official-deadline";
  date: string;
  label: string;
  sourceId: string;
}

/**
 * Deliberately empty: intake does not establish tax year, jurisdiction, extension
 * status, or relief eligibility. A generic April/October date could mislead users.
 * Person 4 must preserve this distinction when extending reminder support.
 */
export async function getVerifiedDeadlines(): Promise<OfficialDeadline[]> {
  return [];
}
