export interface ApiRegion {
  min_lon: number;
  min_lat: number;
  max_lon: number;
  max_lat: number;
  name: string;
}

export interface PopulationResponse {
  timestamp: string;
  region_target: string;
  total_population: number | null;
  source_error?: string;
}

export interface ForecastDayResponse {
  date: string;
  max_temp_c: number;
  min_temp_c: number;
  condition: string;
}

export interface ForecastResponse {
  region_target: string;
  latitude: number;
  longitude: number;
  forecast: ForecastDayResponse[];
}

export interface FacilityResponse {
  name: string;
  address: string | null;
  lat: number | null;
  lon: number | null;
}

export interface InfrastructureResponse {
  hospitals: FacilityResponse[];
  shelters: FacilityResponse[];
  source_errors?: Record<string, string>;
}

export interface CurrentConditionsResponse {
  timestamp: string;
  region_target: string;
  temperature_c: number | null;
  condition: string | null;
  wind_speed_kmh: number | null;
  wind_direction: string | null;
  pressure_hpa: number | null;
  relative_humidity_percent: number | null;
}

export interface HistoricalEventResponse {
  matched_cyclone: string;
  historical_peak_wind_kmh: number | null;
  historical_surge_meters: number | null;
  closest_approach_km: number;
  source: string;
  reference_period: {
    start_date: string;
    end_date: string;
  };
}

export interface HistoricalResponse {
  timestamp: string;
  region_target: string;
  source: string;
  source_url: string;
  total_historical_events_analyzed: number;
  historical_analogs: HistoricalEventResponse[];
}

export interface WhatsAppConfigurationResponse {
  verification_configured: boolean;
  delivery_configured: boolean;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { signal });
  if (!response.ok) {
    let detail = '';
    try {
      const body = await response.json();
      detail = typeof body.detail === 'string' ? ` ${body.detail}` : '';
    } catch {
      // Keep the status/path message when the server does not return JSON.
    }
    throw new Error(`API request failed (${response.status}): ${path}.${detail}`);
  }
  return response.json() as Promise<T>;
}

async function postRequest<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    let detail = '';
    try {
      const result = await response.json();
      detail = typeof result.detail === 'string' ? ` ${result.detail}` : '';
    } catch {
      // Keep the status/path message when the server does not return JSON.
    }
    throw new Error(`API request failed (${response.status}): ${path}.${detail}`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  getRegions: (signal?: AbortSignal) => request<Record<string, ApiRegion>>('/region', signal),
  getPopulation: (region: string, signal?: AbortSignal) =>
    request<PopulationResponse>(`/population?region=${encodeURIComponent(region)}`, signal),
  getForecast: (region: string, signal?: AbortSignal) =>
    request<ForecastResponse>(`/forecast?region=${encodeURIComponent(region)}`, signal),
  getInfrastructure: (region: string, signal?: AbortSignal) =>
    request<InfrastructureResponse>(`/shelter?region=${encodeURIComponent(region)}`, signal),
  getCurrentConditions: (region: string, signal?: AbortSignal) =>
    request<CurrentConditionsResponse>(`/current-conditions?region=${encodeURIComponent(region)}`, signal),
  getHistory: (region: string, signal?: AbortSignal) =>
    request<HistoricalResponse>(`/history?region=${encodeURIComponent(region)}`, signal),
  getWhatsAppConfiguration: (signal?: AbortSignal) =>
    request<WhatsAppConfigurationResponse>('/whatsapp/configuration', signal),
  startWhatsAppVerification: (phone: string) =>
    postRequest<{ status: string }>('/whatsapp/verification/start', { phone }),
  checkWhatsAppVerification: (phone: string, code: string, action: 'subscribe' | 'unsubscribe') =>
    postRequest<{ status: string; action: string }>('/whatsapp/verification/check', { phone, code, action }),
};
