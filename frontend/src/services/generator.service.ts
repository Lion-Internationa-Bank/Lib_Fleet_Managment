import { api } from './api';
import { 
  GeneratorService, 
  GeneratorServiceFormData, 
  GeneratorServiceFilterParams,
  Generator 
} from '../types/Generator';

interface ApiResponse {
  success: boolean;
  count: number;
  total: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  data: GeneratorService[];
}

interface HistoryResponse extends ApiResponse {
  generator?: {
    id: string;
    serial_no: string;
    capacity: number;
    allocation: string;
  };
}

class GeneratorServiceClass {
  private readonly baseUrl = '/maintenance/generators';

  // Get all generator service records
  async getRecords(filters?: GeneratorServiceFilterParams): Promise<ApiResponse> {
    try {
      const params = this.buildQueryParams(filters);
      const response = await api.get<ApiResponse>(this.baseUrl, params);
      return response;
    } catch (error) {
      console.error('Error fetching generator service records:', error);
      throw error;
    }
  }

  // Get service history for a specific generator by ID
  async getGeneratorHistory(generatorId: string, filters?: GeneratorServiceFilterParams): Promise<HistoryResponse> {
    try {
      const params = this.buildQueryParams(filters);
      const response = await api.get<HistoryResponse>(`${this.baseUrl}/history/${generatorId}`, params);
      return response;
    } catch (error) {
      console.error('Error fetching generator history:', error);
      throw error;
    }
  }

  // Get single service record by ID
  async getRecordById(id: string): Promise<{ data: GeneratorService }> {
    try {
      const response = await api.get<{ data: GeneratorService }>(`${this.baseUrl}/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching service record:', error);
      throw error;
    }
  }

  // Create new service record (using serial number)
  async createRecord(data: GeneratorServiceFormData): Promise<{ data: GeneratorService }> {
    try {
      const response = await api.post<{ data: GeneratorService }>(this.baseUrl, data);
      return response;
    } catch (error) {
      console.error('Error creating service record:', error);
      throw error;
    }
  }

  // Update service record (using ID)
  async updateRecord(id: string, data: Partial<Omit<GeneratorServiceFormData, 'generatorSerialNo'>>): Promise<{ data: GeneratorService }> {
    try {
      const response = await api.patch<{ data: GeneratorService }>(`${this.baseUrl}/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error updating service record:', error);
      throw error;
    }
  }

  // Get all generators for reference (optional - for validation)
  async getGenerators(): Promise<Generator[]> {
    try {
      const response = await api.get<{ data: Generator[] }>('/generators');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching generators:', error);
      return [];
    }
  }

  // Validate if a generator exists by serial number
  async validateGenerator(serialNo: string): Promise<Generator | null> {
    try {
      const generators = await this.getGenerators();
      const generator = generators.find(g => 
        g.serial_no.toUpperCase() === serialNo.toUpperCase()
      );
      return generator || null;
    } catch (error) {
      console.error('Error validating generator:', error);
      return null;
    }
  }

  // Build query parameters
  private buildQueryParams(filters?: GeneratorServiceFilterParams): Record<string, any> {
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

export const generatorService = new GeneratorServiceClass();
export default generatorService;