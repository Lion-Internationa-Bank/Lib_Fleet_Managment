import { api } from './api';
import { 
  FuelRecord, 
  FuelRecordFormData, 
  FuelFilterParams,
  ApiResponse,

} from '../types/FuelRecord';

class FuelService {
  private readonly baseUrl = '/tracking/fuel';

  // Get all fuel records with filters
  async getRecords(filters?: FuelFilterParams): Promise<ApiResponse> {
    try {
      const params = this.buildQueryParams(filters);
      const response = await api.get<ApiResponse>(this.baseUrl, params);
      return response;
    } catch (error) {
      console.error('Error fetching fuel records:', error);
      throw error;
    }
  }

  // Get single fuel record by ID
  async getRecordById(id: string): Promise<{ data: FuelRecord }> {
    try {
      const response = await api.get<{ data: FuelRecord }>(`${this.baseUrl}/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching fuel record:', error);
      throw error;
    }
  }

  // Create new fuel record
  async createRecord(data: FuelRecordFormData): Promise<{ data: FuelRecord }> {
    try {
      const response = await api.post<{ data: FuelRecord }>(this.baseUrl, data);
      return response;
    } catch (error) {
      console.error('Error creating fuel record:', error);
      throw error;
    }
  }

  // Update fuel record
  async updateRecord(id: string, data: Partial<FuelRecordFormData>): Promise<{ data: FuelRecord }> {
    try {
      const response = await api.patch<{ data: FuelRecord }>(`${this.baseUrl}/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error updating fuel record:', error);
      throw error;
    }
  }

 
  // Build query parameters from filters
  private buildQueryParams(filters?: FuelFilterParams): Record<string, any> {
    if (!filters) return {};

    const params: Record<string, any> = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params[key] = value;
      }
    });

    return params;
  }
}

export const fuelService = new FuelService();
export default fuelService;