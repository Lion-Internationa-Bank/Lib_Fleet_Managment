export interface ReminderMetadata {
  location?: string;
  allocation?: string;
  identifier?: string;
  provider?: string;
  expiry?: string;
}

export interface ActiveReminder {
  _id: string;
  reminder_type: 'Bolo' | 'Vehicle Maintenance' | 'Generator Maintenance' | 'Insurance' | 'Maintenance Agreement';
  title: string;
  days_left: number;
  due_date: string;
  metadata: ReminderMetadata;
  related_id: string;
  urgency: 'Critical' | 'Warning' | 'Info';
  createdAt: string;
  updatedAt: string;
}

export interface ReminderGroup {
  type: string;
  count: number;
  reminders: ActiveReminder[];
}

export interface ReminderResponse {
  success: boolean;
  total: number;
  count: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
  };
  data: {
    grouped: ReminderGroup[];
    flat: ActiveReminder[];
  };
}

export interface ReminderFilterParams {
  type?: string;
  page?: number;
  limit?: number;
}

export const REMINDER_TYPES = [
  'Bolo',
  'Vehicle Maintenance',
  'Generator Maintenance',
  'Insurance',
  'Maintenance Agreement'
] as const;

export const URGENCY_COLORS = {
  Critical: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    badge: 'bg-red-600',
    icon: 'text-red-600'
  },
  Warning: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    badge: 'bg-yellow-600',
    icon: 'text-yellow-600'
  },
  Info: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
    badge: 'bg-blue-600',
    icon: 'text-blue-600'
  }
};

export const getUrgencyColor = (urgency: string) => {
  return URGENCY_COLORS[urgency as keyof typeof URGENCY_COLORS] || URGENCY_COLORS.Info;
};

export const getTypeIcon = (type: string) => {
  switch (type) {
    case 'Bolo':
      return '🚨';
    case 'Vehicle Maintenance':
      return '🔧';
    case 'Generator Maintenance':
      return '⚡';
    case 'Insurance':
      return '🛡️';
    case 'Maintenance Agreement':
      return '📝';
    default:
      return '📌';
  }
};

export const formatDaysLeft = (days: number): string => {
  if (days < 0) return 'Overdue';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
};

export const getDaysLeftColor = (days: number): string => {
  if (days < 0) return 'text-red-600 font-bold';
  if (days <= 3) return 'text-red-600 font-semibold';
  if (days <= 7) return 'text-orange-600';
  if (days <= 14) return 'text-yellow-600';
  return 'text-green-600';
};