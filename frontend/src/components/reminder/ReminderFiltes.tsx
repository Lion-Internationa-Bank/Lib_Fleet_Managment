import React, { useState, useEffect } from 'react';
import {  X, Filter } from 'lucide-react';
import { ReminderFilterParams, REMINDER_TYPES } from '../../types/Reminder';

interface Props {
  onFilter: (filters: ReminderFilterParams) => void;
  initialFilters?: ReminderFilterParams;
}

const ReminderFilters: React.FC<Props> = ({ onFilter, initialFilters = {} }) => {
  const [filters, setFilters] = useState<ReminderFilterParams>({
    type: '',
    ...initialFilters
  });

  useEffect(() => {
    if (Object.keys(initialFilters).length > 0) {
      setFilters(prev => ({ ...prev, ...initialFilters }));
    }
  }, [initialFilters]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanedFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== '' && value !== undefined && value !== null) {
        acc[key as keyof ReminderFilterParams] = value;
      }
      return acc;
    }, {} as ReminderFilterParams);
    
    onFilter(cleanedFilters);
  };

  const handleReset = () => {
    setFilters({
      type: '',
    });
    onFilter({});
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '' && v !== undefined);

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 text-gray-700">
          <Filter size={20} />
          <span className="font-medium">Filter Reminders</span>
        </div>
        {hasActiveFilters && (
          <button 
            onClick={handleReset} 
            className="text-sm text-red-600 hover:text-red-800 flex items-center"
          >
            <X size={16} className="mr-1" />
            Clear Filters
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reminder Type
            </label>
            <select
              name="type"
              value={filters.type || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              {REMINDER_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-4 space-x-2">
          {hasActiveFilters && (
            <button 
              type="button" 
              onClick={handleReset} 
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Clear
            </button>
          )}
          <button 
            type="submit" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReminderFilters;