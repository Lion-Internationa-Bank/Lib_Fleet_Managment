export interface Generator {
  _id: string;
  serial_no: string;
  capacity: number;
  allocation: string;
  location?: string;
  engine_brand?: string;
  acquisition_cost?: number;
  acquisition_date?: string;
  current_hour_meter: number;
  last_service_date?: string;
  next_service_date?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratorService {
  _id: string;
  generatorId: Generator | string;
  allocation: string;
  hour_meter_reading: number;
  next_service_hour: number;
  maintenance_type: 'Preventive' | 'Corrective' | 'Breakdown' | 'Body & Paint';
  description?: string;
  service_provider: string;
  service_date: string;
  cost: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratorServiceFormData {
  generatorSerialNo: string;  // Used only for creation
  hour_meter_reading: number;
  next_service_hour: number;
  maintenance_type: 'Preventive' | 'Corrective' | 'Breakdown' | 'Body & Paint';
  description?: string;
  service_provider: string;
  service_date: string;
  cost: number;
  status: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}


export interface GeneratorServiceFilterParams {
  generatorSerialNo?: string;  // Search by serial number
  maintenance_type?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export const GENERATOR_MAINTENANCE_TYPES = [
  'Preventive',
  'Corrective',
  'Breakdown',
  'Body & Paint'
] as const;

export const GENERATOR_STATUS_OPTIONS = [
  'Operational',
  'Under Maintenance',
  'Faulty',
  'Decommissioned'
] as const;

// Helper to get generator info from service
export const getGeneratorFromService = (service: GeneratorService): { id: string; serial_no: string; capacity: number } | null => {
  if (typeof service.generatorId === 'string') return null;
  return {
    id: service.generatorId._id,
    serial_no: service.generatorId.serial_no,
    capacity: service.generatorId.capacity
  };
};