export type EmergencyType = "Pregnancy" | "Accident" | "Illness" | "Other";

export type EmergencyStatus = 
  | "Pending" 
  | "Forwarded" 
  | "Ambulance Assigned" 
  | "Received" 
  | "Ambulance Dispatched"
  | "On Route"
  | "Reached"
  | "Treated"
  | "Complete"
  | "Resolved";

export interface Emergency {
  id: string;
  name: string;
  type: EmergencyType;
  location: string;
  wardNo: string;
  phone?: string;
  time: string;
  status: EmergencyStatus;
  hospitalId?: string;
  ambulanceId?: string;
  lat?: number;
  lng?: number;
}

export interface Hospital {
  id: string;
  name: string;
  beds: number;
  doctors: number;
  ambulances: number;
  readiness: "high" | "medium" | "low";
}
