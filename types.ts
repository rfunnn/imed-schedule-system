
export interface User {
  name: string;
  icNo: string;
  psNo?: string;
  email?: string;
}

export interface Appointment {
  id: string;
  name: string;
  icNo: string;
  // Added psNo property to fix 'Object literal may only specify known properties' errors in Dashboard.tsx
  psNo?: string;
  tcaDate: string;
  scheduleSupplyDate: string;
  prescriptionId?: string;
  status: 'PENDING' | 'COMPLETED';
  is_insulin?: boolean;
  is_arrived?: boolean;
  receivedDate?: string;
  initial?: string;
}

export interface ApiLog {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  direction: 'INCOMING' | 'OUTGOING';
  status?: number;
  body: any;
}

export type LogLevel = 'info' | 'error' | 'success';
