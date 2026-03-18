import { api } from './api';
import { 
  Tire, 
  TireFormData, 
  TireRotationData,
  TireFilterParams,
  ApiResponse 
} from '../types/Tire';

class TireService {
  private readonly baseUrl = '/tires';

  // Get all tires with filters
  async getTires(filters?: TireFilterParams): Promise<ApiResponse> {
    try {
      const params = this.buildQueryParams(filters);
      const response = await api.get<ApiResponse>(this.baseUrl, params);
      return response;
    } catch (error) {
      console.error('Error fetching tires:', error);
      throw error;
    }
  }

  // Get tire by ID
  async getTireById(id: string): Promise<{ data: Tire }> {
    try {
      const response = await api.get<{ data: Tire }>(`${this.baseUrl}/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching tire:', error);
      throw error;
    }
  }

  // Get tires by vehicle plate number
  async getTiresByVehicle(plateNo: string, filters?: { status?: string; include_history?: string }): Promise<{ data: Tire[]; count: number }> {
    try {
      const params = this.buildQueryParams(filters || {});
      const response = await api.get<{ data: Tire[]; count: number }>(`${this.baseUrl}/vehicle/${plateNo}`, params);
      return response;
    } catch (error) {
      console.error('Error fetching vehicle tires:', error);
      throw error;
    }
  }

  // Create new tire
  async createTire(data: TireFormData): Promise<{ data: Tire }> {
    try {
      const response = await api.post<{ data: Tire }>(this.baseUrl, data);
      return response;
    } catch (error) {
      console.error('Error creating tire:', error);
      throw error;
    }
  }

  // Update tire
  async updateTire(id: string, data: Partial<TireFormData>): Promise<{ data: Tire }> {
    try {
      const response = await api.patch<{ data: Tire }>(`${this.baseUrl}/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error updating tire:', error);
      throw error;
    }
  }

  // Rotate tires
  async rotateTires(data: TireRotationData): Promise<{ data: any }> {
    try {
      const response = await api.patch<{ data: any }>(`${this.baseUrl}/rotate`, data);
      return response;
    } catch (error) {
      console.error('Error rotating tires:', error);
      throw error;
    }
  }

  // Build query parameters
  private buildQueryParams(filters?: Record<string, any>): Record<string, any> {
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

export const tireService = new TireService();
export default tireService;