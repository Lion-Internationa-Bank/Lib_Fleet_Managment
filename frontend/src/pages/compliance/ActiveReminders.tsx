import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  RefreshCw, Bell, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight
} from 'lucide-react';
import reminderService from '../../services/reminder.service';
import { 
  ReminderResponse, 
  ReminderFilterParams,
  ReminderGroup as ReminderGroupType
} from '../../types/Reminder';

import ReminderFilters from '../../components/reminder/ReminderFiltes';
import ReminderGroup from '../../components/reminder/ReminderGroup';
const ActiveReminders: React.FC = () => {
  const [reminders, setReminders] = useState<ReminderResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ReminderFilterParams>({
    page: 1,
    limit: 50
  });

  useEffect(() => {
    fetchReminders();
  }, [filters]);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const response = await reminderService.getActiveReminders(filters);
      setReminders(response);
    } catch (error) {
      toast.error('Failed to fetch active reminders');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (newFilters: ReminderFilterParams) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = Number(e.target.value);
    setFilters(prev => ({ ...prev, limit: newLimit, page: 1 }));
  };

  // Safe helper functions with optional chaining and null checks
  const getSummaryStats = () => {
    if (!reminders?.data?.flat) {
      return { total: 0, critical: 0, warning: 0, info: 0 };
    }
    
    const flat = reminders.data.flat;
    return {
      total: flat.length,
      critical: flat.filter(r => r?.urgency === 'Critical').length,
      warning: flat.filter(r => r?.urgency === 'Warning').length,
      info: flat.filter(r => r?.urgency === 'Info').length
    };
  };

  const hasGroupedData = (): boolean => {
    return !!(reminders?.data?.grouped && reminders.data.grouped.length > 0);
  };

  const getGroupedData = (): ReminderGroupType[] => {
    return reminders?.data?.grouped || [];
  };

  const stats = getSummaryStats();

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Bell className="mr-2 text-blue-600" />
            Active Reminders
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Track all upcoming deadlines and expirations
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600">Total Reminders</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <p className="text-sm text-gray-600">Critical</p>
          <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-600">Warning</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.warning}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-600">Info</p>
          <p className="text-2xl font-bold text-green-600">{stats.info}</p>
        </div>
      </div>

      <ReminderFilters onFilter={handleFilter} initialFilters={filters} />

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <RefreshCw size={30} className="animate-spin text-blue-600" />
        </div>
      )}

      {/* No Data State - Check with safe helper */}
      {!loading && !hasGroupedData() && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Bell size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Reminders</h3>
          <p className="text-gray-500">All your deadlines are under control!</p>
        </div>
      )}

      {/* Reminders Groups - With safe optional chaining */}
      {!loading && hasGroupedData() && (
        <div className="space-y-4">
          {getGroupedData().map((group: ReminderGroupType) => (
            <ReminderGroup 
              key={group.type} 
              group={group} 
              defaultExpanded={group.reminders?.some(r => r?.urgency === 'Critical') || false}
            />
          ))}
        </div>
      )}

      {/* Pagination - With safe checks */}
      {reminders?.pagination && reminders.pagination.totalPages > 1 && (
        <div className="mt-6 bg-white px-4 py-3 flex items-center justify-between border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Show</span>
            <select
              value={filters.limit}
              onChange={handleLimitChange}
              className="border border-gray-300 rounded-md text-sm px-2 py-1 focus:ring-2 focus:ring-blue-500"
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-gray-700">entries</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(1)}
              disabled={reminders.pagination.page === 1}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="First page"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => handlePageChange(reminders.pagination.page - 1)}
              disabled={reminders.pagination.page === 1}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            
            <span className="text-sm text-gray-700 px-3">
              Page {reminders.pagination.page} of {reminders.pagination.totalPages}
            </span>
            
            <button
              onClick={() => handlePageChange(reminders.pagination.page + 1)}
              disabled={reminders.pagination.page === reminders.pagination.totalPages}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => handlePageChange(reminders.pagination.totalPages)}
              disabled={reminders.pagination.page === reminders.pagination.totalPages}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Last page"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveReminders;