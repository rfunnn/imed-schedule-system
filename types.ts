
export interface User {
  name: string;
  icNo: string;
  psNo?: string;
  email?: string;
}

export enum AppointmentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export interface Appointment {
  id: string;
  name: string;
  icNo: string;
  psNo?: string;
  tcaDate: string;
  scheduleSupplyDate: string;
  prescriptionId?: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  is_insulin?: boolean;
  is_arrived?: boolean;
  receivedDate?: string;
  initial?: string;
}

export interface CreateAppointmentNewUserDTO {
  name: string;
  icNo: string;
  psNo?: string | null;
  tcaDate: string;
  scheduleSupplyDate?: string;
  status?: string;
}

export interface CreateAppointmentsFromExistingDTO {
  selectedIds: string[];
  tcaDate?: string;
  scheduleSupplyDate?: string;
  status?: string;
}

export interface DownloadFormRequestDTO {
  appointmentIds?: string[] | null;
  fromDate?: string | null;
  toDate?: string | null;
  includeColumns?: string[] | null;
  fillBlankColumns: string[];
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
