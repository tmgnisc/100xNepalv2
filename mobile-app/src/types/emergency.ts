export type EmergencyType = "Pregnancy" | "Accident" | "Illness" | "Other";

export interface Emergency {
  id: string;
  name: string;
  type: EmergencyType;
  location: string;
  wardNo: string;
  phone?: string;
  time: string;
  status: string;
  lat?: number;
  lng?: number;
}

