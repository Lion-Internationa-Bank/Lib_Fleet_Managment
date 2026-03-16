export interface FuelRecord {
  _id: string;
  plate_no: string;
  fuel_type: 'Diesel' | 'Regular' | 'Octane';
  starting_date: string;
  starting_km: number;
  fuel_in_birr: number;
  birr_per_liter: number;
  liter_used: number;
  fuel_usage_type: string;
  remark?: string;
  ending_date?: string | null;
  ending_km?: number | null;
  km_diff?: number | null;
  km_per_lit?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface FuelRecordFormData {
  plate_no: string;
  starting_date: string;
  starting_km: number;
  fuel_in_birr: number;
  birr_per_liter: number;
  fuel_usage_type: string;
  remark?: string;
}

export interface FuelFilterParams {
  plate_no?: string;
  fuel_type?: string;
  fuel_usage_type?: string;
  start_date?: string;
  end_date?: string;
  is_completed?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse {
  success: boolean;
  count: number;
  total: number;
  pagination: PaginationInfo;
  data: FuelRecord[];
}

// Fuel usage type options for dropdown
export const FUEL_USAGE_TYPES = [
  'Work',
  'Personal',
  'Long distance',
  'City driving',
  'Off-road',
  'Delivery',
  'Field operation',
  'Maintenance test',
  'Other'
] as const;

export type FuelUsageType = typeof FUEL_USAGE_TYPES[number];

// Helper function to determine fuel consumption status
export const getFuelConsumptionStatus = (kmPerLit: number | null | undefined): { label: string; color: string } => {
  if (!kmPerLit) return { label: 'N/A', color: 'bg-gray-100 text-gray-800' };
  
  if (kmPerLit >= 8) {
    return { label: 'Low Consumption', color: 'bg-green-100 text-green-800' };
  } else if (kmPerLit <= 6.5) {
    return { label: 'High Consumption', color: 'bg-red-100 text-red-800' };
  } else {
    return { label: 'Normal', color: 'bg-blue-100 text-blue-800' };
  }
};