
import { ApiLog } from '../types';

export const apiService = {
  async fetchWithLogging(
    url: string,
    options: RequestInit,
    addLog: (log: ApiLog) => void
  ) {
    const logId = Math.random().toString(36).substring(7);
    
    // Log Outgoing Request
    addLog({
      id: logId + '-out',
      timestamp: new Date().toISOString(),
      method: options.method || 'GET',
      url: url,
      direction: 'OUTGOING',
      body: options.body ? JSON.parse(options.body as string) : null,
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

      // Log Incoming Response
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

  async createUser(payload: any, addLog: (log: ApiLog) => void) {
    // Vercel serverless function endpoint
    return this.fetchWithLogging('/api/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }, addLog);
  },

  async updateUser(icNo: string, payload: any, addLog: (log: ApiLog) => void) {
    // Vercel serverless function endpoint with PATCH intent
    return this.fetchWithLogging(`/api/create-user?icNo=${icNo}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-HTTP-Method-Override': 'PATCH'
      },
      body: JSON.stringify({ ...payload, _method: 'PATCH' }),
    }, addLog);
  },

  async getUser(icNo: string, addLog: (log: ApiLog) => void) {
    // Vercel serverless function endpoint for lookups
    return this.fetchWithLogging(`/api/get-user?icNo=${icNo}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }, addLog);
  }
};
