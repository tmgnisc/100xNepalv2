import { Emergency, Hospital } from "@/types/emergency";

export const mockHospitals: Hospital[] = [
  { id: "h1", name: "Karnali Provincial Hospital", beds: 15, doctors: 8, ambulances: 3, readiness: "high" },
  { id: "h2", name: "Jumla District Hospital", beds: 8, doctors: 5, ambulances: 2, readiness: "medium" },
  { id: "h3", name: "Mugu Health Post", beds: 4, doctors: 2, ambulances: 1, readiness: "low" },
];

const emergencyNames = [
  "Ramesh Thapa", "Sita Karki", "Krishna Sharma", "Maya Poudel", 
  "Bikash Rai", "Anita Gurung", "Suresh Tamang", "Kopila Magar"
];

const locations = [
  "Khalanga Bazaar", "Patarasi Village", "Chhumchaur", "Dillichaur", 
  "Kartikswami", "Rara Lake Area", "Sinja Valley", "Tatopani"
];

export function generateMockEmergency(): Emergency {
  const types: Emergency["type"][] = ["Pregnancy", "Accident", "Illness", "Other"];
  const name = emergencyNames[Math.floor(Math.random() * emergencyNames.length)];
  const location = locations[Math.floor(Math.random() * locations.length)];
  const type = types[Math.floor(Math.random() * types.length)];
  
  return {
    id: `E${Date.now()}${Math.floor(Math.random() * 1000)}`,
    name,
    type,
    location,
    wardNo: `Ward ${Math.floor(Math.random() * 10) + 1}`,
    phone: `98${Math.floor(Math.random() * 100000000)}`,
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    status: "Pending",
    lat: 29.27 + (Math.random() - 0.5) * 0.5,
    lng: 82.19 + (Math.random() - 0.5) * 0.5,
  };
}

export function getEmergenciesFromStorage(): Emergency[] {
  const stored = localStorage.getItem('aarogyaEmergencies');
  return stored ? JSON.parse(stored) : [];
}

export function saveEmergenciesToStorage(emergencies: Emergency[]) {
  localStorage.setItem('aarogyaEmergencies', JSON.stringify(emergencies));
}
