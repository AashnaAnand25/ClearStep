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

/** No verified deadlines are supplied for this prototype. A data service can fill this later. */
export async function getVerifiedDeadlines(): Promise<OfficialDeadline[]> {
  return [];
}
