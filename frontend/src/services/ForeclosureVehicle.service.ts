import { api } from './api';
import { 
  ForeclosureVehicle, 
  ForeclosureVehicleFormData, 
  ForeclosureVehicleFilters,
  ApiResponse 
} from '../types/ForeclosureVehicle';

class ForeclosureVehicleService {
  private readonly baseUrl = '/forclosures';

  // Get all foreclosure vehicles with filters
  async getVehicles(filters?: ForeclosureVehicleFilters): Promise<ApiResponse> {
    try {
      const params = this.buildQueryParams(filters);
      const response = await api.get<ApiResponse>(this.baseUrl, params);
      return response;
    } catch (error) {
      console.error('Error fetching foreclosure vehicles:', error);
      throw error;
    }
  }

  // Get single vehicle by plate number
  async getVehicleByPlate(plateNo: string): Promise<ForeclosureVehicle> {
    try {
      const response = await api.get<{ data: ForeclosureVehicle }>(`${this.baseUrl}/${plateNo}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching foreclosure vehicle:', error);
      throw error;
    }
  }

  // Create new foreclosure vehicle
  async createVehicle(data: ForeclosureVehicleFormData): Promise<ForeclosureVehicle> {
    try {
      const response = await api.post<{ data: ForeclosureVehicle }>(this.baseUrl, data);
      return response.data;
    } catch (error) {
      console.error('Error creating foreclosure vehicle:', error);
      throw error;
    }
  }

  // Update vehicle by plate number
  async updateVehicle(plateNo: string, data: Partial<ForeclosureVehicleFormData>): Promise<ForeclosureVehicle> {
    try {
      const response = await api.put<{ data: ForeclosureVehicle }>(`${this.baseUrl}/${plateNo}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating foreclosure vehicle:', error);
      throw error;
    }
  }

  // Update date_out by plate number
  async updateDateOut(plateNo: string, dateOut: string | null): Promise<ForeclosureVehicle> {
    try {
      const response = await api.patch<{ data: ForeclosureVehicle }>(
        `${this.baseUrl}/date-out/${plateNo}`, 
        { date_out: dateOut }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating date_out:', error);
      throw error;
    }
  }

  // Delete vehicle (if needed - add backend endpoint first)
  async deleteVehicle(plateNo: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${plateNo}`);
    } catch (error) {
      console.error('Error deleting foreclosure vehicle:', error);
      throw error;
    }
  }

  // Build query parameters from filters
  private buildQueryParams(filters?: ForeclosureVehicleFilters): Record<string, any> {
    if (!filters) return {};

    const params: Record<string, any> = {};

    if (filters.plate_no) params.plate_no = filters.plate_no;
    if (filters.property_owner) params.property_owner = filters.property_owner;
    if (filters.lender_branch) params.lender_branch = filters.lender_branch;
    if (filters.parking_place) params.parking_place = filters.parking_place;
    if (filters.date_into) params.date_into = filters.date_into;
    if (filters.date_out) params.date_out = filters.date_out;
    if (filters.status) params.status = filters.status;
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;
    if (filters.sort) params.sort = filters.sort;

    // Remove undefined values
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

    return params;
  }
}

export const foreclosureVehicleService = new ForeclosureVehicleService();
export default foreclosureVehicleService;