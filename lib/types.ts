export type VerificationType = "qr" | "geo" | "hybrid" | "manual";
export type EventMode = "online" | "offline" | "hybrid";

export interface Event {
  id: string;
  title: string;
  description?: string | null;
  eventDate?: string;
  org: string;
  orgLogo: string;
  location: string;
  mode: EventMode;
  skills: string[];
  participants: number;
  maxParticipants: number;
  verification: VerificationType;
  trustRequired: number;
  date: string;
  hours: number;
  featured?: boolean;
}

export interface VolunteerStats {
  trustScore: number;
  leadershipIndex: number;
  impactHours: number;
  admissionsReadiness: number;
}
