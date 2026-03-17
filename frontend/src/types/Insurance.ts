export interface Insurance {
  _id: string;
  insurance_provider: string;
  insurance_renewal_date: string;
  insurance_expired_date: string;
  reminder_date?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InsuranceFormData {
  insurance_provider: string;
  insurance_renewal_date: string;
  insurance_expired_date: string;
}

export interface InsuranceFilterParams {
  insurance_provider?: string;
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
  total?: number;
  pagination?: PaginationInfo;
  data: Insurance[];
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

export const getInsuranceStatus = (expiryDate: string): { label: string; color: string } => {
  const daysRemaining = calculateDaysRemaining(expiryDate);
  
  if (daysRemaining < 0) {
    return { label: 'Expired', color: 'bg-red-100 text-red-800' };
  } else if (daysRemaining <= 7) {
    return { label: 'Critical', color: 'bg-red-100 text-red-800' };
  } else if (daysRemaining <= 15) {
    return { label: 'Warning', color: 'bg-yellow-100 text-yellow-800' };
  } else if (daysRemaining <= 30) {
    return { label: 'Attention', color: 'bg-orange-100 text-orange-800' };
  } else {
    return { label: 'Active', color: 'bg-green-100 text-green-800' };
  }
};

export const getReminderStatus = (reminderDate: string | undefined): { label: string; color: string } | null => {
  if (!reminderDate) return null;
  
  const daysRemaining = calculateDaysRemaining(reminderDate);
  
  if (daysRemaining < 0) {
    return { label: 'Reminder Passed', color: 'bg-gray-100 text-gray-800' };
  } else if (daysRemaining <= 2) {
    return { label: 'Reminder Soon', color: 'bg-yellow-100 text-yellow-800' };
  } else {
    return { label: 'Reminder Set', color: 'bg-blue-100 text-blue-800' };
  }
};