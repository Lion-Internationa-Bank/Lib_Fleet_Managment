export interface MaintenanceAgreement {
  _id: string;
  service_provider: string;
  contract_renewal_date: string;
  contract_expiry_date: string;
  new_contract_date?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgreementFormData {
  service_provider: string;
  contract_renewal_date: string;
  contract_expiry_date: string;
}

export interface AgreementFilterParams {
  service_provider?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  totalPages: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse {
  success: boolean;
  count: number;
  total: number;
  pagination: PaginationInfo;
  data: MaintenanceAgreement[];
}

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

export const calculateDaysRemaining = (expiryDate: string): number => {
  const expiry = new Date(expiryDate).getTime();
  const today = new Date().getTime();
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const getExpiryStatus = (expiryDate: string): { label: string; color: string } => {
  const daysRemaining = calculateDaysRemaining(expiryDate);
  
  if (daysRemaining < 0) {
    return { label: 'Expired', color: 'bg-red-100 text-red-800' };
  } else if (daysRemaining <= 30) {
    return { label: 'Expiring Soon', color: 'bg-yellow-100 text-yellow-800' };
  } else if (daysRemaining <= 90) {
    return { label: 'Near Expiry', color: 'bg-orange-100 text-orange-800' };
  } else {
    return { label: 'Active', color: 'bg-green-100 text-green-800' };
  }
};