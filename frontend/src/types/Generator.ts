export interface Generator {
  _id: string;
  location?: string;
  allocation: string;
  capacity: number;
  engine_brand?: string;
  serial_no: string;
  acquisition_cost?: number;
  acquisition_date?: string;
  current_hour_meter: number;
  last_service_date?: string;
  next_service_date?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratorFormData {
  location?: string;
  allocation: string;
  capacity: number;
  engine_brand?: string;
  serial_no: string;
  acquisition_cost?: number;
  acquisition_date?: string;
  current_hour_meter: number;
  last_service_date?: string;
  next_service_date?: string;
  status: string;
}

export interface GeneratorFilterParams {
  location?: string;
  allocation?: string;
  engine_brand?: string;
  serial_no?: string;
  capacity_min?: number;
  capacity_max?: number;
  status?: string;
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
  data: Generator[];
}

export const GENERATOR_STATUS_OPTIONS = [
  'Operational',
  'Under Maintenance',
  'Faulty',
  'Decommissioned'
] as const;

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Operational':
      return 'bg-green-100 text-green-800';
    case 'Under Maintenance':
      return 'bg-yellow-100 text-yellow-800';
    case 'Faulty':
      return 'bg-red-100 text-red-800';
    case 'Decommissioned':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'N/A';
  return `ETB ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'N/A';
  return value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
};