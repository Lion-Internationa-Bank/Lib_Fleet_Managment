export interface TireRotationHistory {
  from_position: string;
  to_position: string;
  rotation_date: string;
  km_at_rotation: number;
  reason?: string;
  _id?: string;
}

export interface Tire {
  _id: string;
  plate_no: string;
  make: string;
  serial_no: string;
  ply_rate: number;
  position: string;
  status: 'Active' | 'Worn Out';
  fitted_date: string;
  fitted_km: number;
  worn_out_date?: string | null;
  worn_out_km?: number | null;
  km_difference?: number | null;
  unit_price: number;
  cost_per_km?: number | null;
  reason_for_change?: string | null;
  rotation_history: TireRotationHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface TireFormData {
  plate_no: string;
  make: string;
  serial_no: string;
  ply_rate: number;
  position: string;
  fitted_date: string;
  fitted_km: number;
  unit_price: number;
  reason_for_change?: string;
}

export interface TireRotationData {
  from_tire_id: string;
  to_tire_id: string;
  rotation_date?: string;
  km_at_rotation: number;
  reason?: string;
}

export interface TireFilterParams {
  plate_no?: string;
  position?: string;
  status?: 'Active' | 'Worn Out' | 'all';
  page?: number;
  limit?: number;
  sort?: string;
  include_history?: 'true' | 'false';
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
  data: Tire[];
}

export const TIRE_POSITIONS = [
  'Front Left',
  'Front Right',
  'Middle Left',
  'Middle Right',
  'Rear Left',
  'Rear Right',
  'Spare'
] as const;

export const TIRE_STATUS_OPTIONS = [
  'Active',
  'Worn Out'
] as const;

export const getPositionColor = (position: string): string => {
  if (position.includes('Left')) return 'border-l-4 border-blue-500';
  if (position.includes('Right')) return 'border-l-4 border-green-500';
  if (position.includes('Middle')) return 'border-l-4 border-purple-500';
  if (position === 'Spare') return 'border-l-4 border-gray-500';
  return 'border-l-4 border-gray-300';
};

export const getPositionBgColor = (position: string): string => {
  if (position.includes('Left')) return 'bg-blue-50';
  if (position.includes('Right')) return 'bg-green-50';
  if (position.includes('Middle')) return 'bg-purple-50';
  if (position === 'Spare') return 'bg-gray-50';
  return 'bg-white';
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 2
  }).format(value);
};

export const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (dateStr?: string | null): string => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const calculateTireLife = (tire: Tire): { percentage: number; remainingKm: number } => {
  if (!tire.km_difference || tire.km_difference === 0 || tire.unit_price === 0) {
    return { percentage: 0, remainingKm: 0 };
  }
  
  // Assuming cost_per_km is calculated, we can estimate remaining life
  // This is a simplified calculation - adjust based on your business logic
  const estimatedTotalKm = tire.unit_price / (tire.cost_per_km || 0.01);
  const percentage = Math.min(100, (tire.km_difference / estimatedTotalKm) * 100);
  const remainingKm = Math.max(0, estimatedTotalKm - tire.km_difference);
  
  return { percentage, remainingKm };
};