
import { 
  CreateAppointmentNewUserDTO, 
} from '../types.ts';

export const apiService = {
  async request(url: string, options: RequestInit) {
    try {
      const response = await fetch(url, options);
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
      return { data, status: response.status, ok: response.ok };
    } catch (error) {
      console.error(`API Request Error [${url}]:`, error);
      throw error;
    }
  },

  async getAppointments(page: number = 1, pageSize: number = 20) {
    return this.request(`/api/appointments/list?page=${page}&pageSize=${pageSize}`, { method: 'GET' });
  },

  async createNewUser(dto: CreateAppointmentNewUserDTO) {
    return this.request(`/api/appointments/create-new-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
  },

  async updateUser(icNo: string, dto: any) {
    // We send a POST to our proxy, which will handle the _method: "PATCH" tunneling for Apps Script
    return this.request(`/api/appointments/update-user?icNo=${encodeURIComponent(icNo)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    });
  },

  async getUser(icNo: string) {
    return this.request(`/api/appointments/get-user?icNo=${encodeURIComponent(icNo)}`, {
      method: 'GET',
    });
  }
};
