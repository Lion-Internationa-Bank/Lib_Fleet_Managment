import { api } from './api';
import { 
  Accident, 
  AccidentFormData, 
  AccidentFilterParams,
  ApiResponse 
} from '../types/Accident';

class AccidentService {
  private readonly baseUrl = '/tracking/accidents';

  // Get all accident records with filters
  async getRecords(filters?: AccidentFilterParams): Promise<ApiResponse> {
    try {
      const params = this.buildQueryParams(filters);
      const response = await api.get<ApiResponse>(this.baseUrl, params);
      return response;
    } catch (error) {
      console.error('Error fetching accident records:', error);
      throw error;
    }
  }

  // Get single accident record by ID
  async getRecordById(id: string): Promise<{ data: Accident }> {
    try {
      const response = await api.get<{ data: Accident }>(`${this.baseUrl}/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching accident record:', error);
      throw error;
    }
  }

  // Create new accident record
  async createRecord(data: AccidentFormData): Promise<{ data: Accident }> {
    try {
      const response = await api.post<{ data: Accident }>(this.baseUrl, data);
      return response;
    } catch (error) {
      console.error('Error creating accident record:', error);
      throw error;
    }
  }

  // Update accident record
  async updateRecord(id: string, data: Partial<AccidentFormData>): Promise<{ data: Accident }> {
    try {
      const response = await api.patch<{ data: Accident }>(`${this.baseUrl}/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error updating accident record:', error);
      throw error;
    }
  }

  // Build query parameters from filters
  private buildQueryParams(filters?: AccidentFilterParams): Record<string, any> {
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

export const accidentService = new AccidentService();
export default accidentService;