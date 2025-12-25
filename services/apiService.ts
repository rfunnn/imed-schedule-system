
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
    
    let logBody = null;
    try {
      logBody = options.body ? JSON.parse(options.body as string) : null;
    } catch (e) {
      logBody = { raw: options.body };
    }

    addLog({
      id: logId + '-out',
      timestamp: new Date().toISOString(),
      method: options.method || 'GET',
      url: url,
      direction: 'OUTGOING',
      body: logBody,
    });

    try {
      const response = await fetch(url, options);
      const text = await response.text();
      let data;
      
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
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

  async createNewUser(dto: CreateAppointmentNewUserDTO, addLog: (log: ApiLog) => void) {
    // Explicitly using /api/create-user as requested
    return this.fetchWithLogging(`/api/create-user?icNo=${dto.icNo}&action=create-new-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...dto, action: 'create-new-user' }),
    }, addLog);
  },

  async updateUser(icNo: string, dto: any, addLog: (log: ApiLog) => void) {
    // Explicitly using /api/create-user as requested
    return this.fetchWithLogging(`/api/create-user?icNo=${icNo}&action=update-user`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-HTTP-Method-Override': 'PATCH'
      },
      body: JSON.stringify({ ...dto, _method: 'PATCH', action: 'update-user' }),
    }, addLog);
  },

  async getUser(icNo: string, addLog: (log: ApiLog) => void) {
    return this.fetchWithLogging(`/api/get-user?icNo=${icNo}`, {
      method: 'GET',
    }, addLog);
  }
};
