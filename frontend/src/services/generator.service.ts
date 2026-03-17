import { api } from './api';
import { 
  Generator, 
  GeneratorFormData, 
  GeneratorFilterParams,
  ApiResponse 
} from '../types/Generator';

class GeneratorService {
  private readonly baseUrl = '/generators';

  // Get all generators with filters
  async getGenerators(filters?: GeneratorFilterParams): Promise<ApiResponse> {
    try {
      const params = this.buildQueryParams(filters);
      const response = await api.get<ApiResponse>(this.baseUrl, params);
      return response;
    } catch (error) {
      console.error('Error fetching generators:', error);
      throw error;
    }
  }

  // Get single generator by ID
  async getGeneratorById(id: string): Promise<{ data: Generator }> {
    try {
      const response = await api.get<{ data: Generator }>(`${this.baseUrl}/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching generator:', error);
      throw error;
    }
  }

  // Create new generator
  async createGenerator(data: GeneratorFormData): Promise<{ data: Generator }> {
    try {
      const response = await api.post<{ data: Generator }>(this.baseUrl, data);
      return response;
    } catch (error) {
      console.error('Error creating generator:', error);
      throw error;
    }
  }

  // Update generator
  async updateGenerator(id: string, data: Partial<GeneratorFormData>): Promise<{ data: Generator }> {
    try {
      const response = await api.patch<{ data: Generator }>(`${this.baseUrl}/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error updating generator:', error);
      throw error;
    }
  }

  // Build query parameters from filters
  private buildQueryParams(filters?: GeneratorFilterParams): Record<string, any> {
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

export const generatorService = new GeneratorService();
export default generatorService;