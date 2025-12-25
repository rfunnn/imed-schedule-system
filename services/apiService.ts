
import { 
  ApiLog, 
  CreateAppointmentNewUserDTO, 
  CreateAppointmentsFromExistingDTO, 
  DownloadFormRequestDTO 
} from '../types.ts';

export const apiService = {
  async fetchWithLogging(
    url: string,
    options: RequestInit,
    addLog: (log: ApiLog) => void
  ) {
    const logId = Math.random().toString(36).substring(7);
    
    addLog({
      id: logId + '-out',
      timestamp: new Date().toISOString(),
      method: options.method || 'GET',
      url: url,
      direction: 'OUTGOING',
      body: options.body ? JSON.parse(options.body as string) : (options.method === 'GET' ? null : {}),
    });

    try {
      const response = await fetch(url, options);
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      addLog({
        id: logId + '-in',
        timestamp: new Date().toISOString(),
        method: options.method || 'GET',
        url: url,
        direction: 'INCOMING',
        status: response.status,
        body: data,
      });

      return { data, status: response.status, ok: response.ok };
    } catch (error) {
      addLog({
        id: logId + '-err',
        timestamp: new Date().toISOString(),
        method: options.method || 'GET',
        url: url,
        direction: 'INCOMING',
        body: { error: String(error) },
      });
      throw error;
    }
  },

  async listAppointments(query: any, addLog: (log: ApiLog) => void) {
    const params = new URLSearchParams(query).toString();
    return this.fetchWithLogging(`/api/appointments/list?${params}`, {
      method: 'GET',
    }, addLog);
  },

  async createNewUser(dto: CreateAppointmentNewUserDTO, addLog: (log: ApiLog) => void) {
    return this.fetchWithLogging('/api/appointments/create-new-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    }, addLog);
  },

  async updateUser(icNo: string, dto: any, addLog: (log: ApiLog) => void) {
    return this.fetchWithLogging(`/api/appointments/update-user?icNo=${icNo}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-HTTP-Method-Override': 'PATCH'
      },
      body: JSON.stringify(dto),
    }, addLog);
  },

  async createFromExisting(dto: CreateAppointmentsFromExistingDTO, addLog: (log: ApiLog) => void) {
    return this.fetchWithLogging('/api/appointments/create-from-existing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    }, addLog);
  },

  async downloadForm(dto: DownloadFormRequestDTO, addLog: (log: ApiLog) => void) {
    return this.fetchWithLogging('/api/appointments/download-form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    }, addLog);
  },

  async getUser(icNo: string, addLog: (log: ApiLog) => void) {
    return this.fetchWithLogging(`/api/appointments/get-user?icNo=${icNo}`, {
      method: 'GET',
    }, addLog);
  }
};
