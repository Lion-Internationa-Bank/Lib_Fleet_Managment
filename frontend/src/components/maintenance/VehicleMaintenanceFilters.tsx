import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { VehicleMaintenanceFilterParams, MAINTENANCE_TYPES } from '../../types/Maintenance';

interface Props {
  onFilter: (filters: VehicleMaintenanceFilterParams) => void;
  initialFilters?: VehicleMaintenanceFilterParams;
}

const VehicleMaintenanceFilters: React.FC<Props> = ({ onFilter, initialFilters = {} }) => {
  const [filters, setFilters] = useState<VehicleMaintenanceFilterParams>({
    plate_no: '',
    maintenance_type: '',
    date_from: '',
    date_to: '',
    ...initialFilters
  });

  useEffect(() => {
    if (Object.keys(initialFilters).length > 0) {
      setFilters(prev => ({ ...prev, ...initialFilters }));
    }
  }, [initialFilters]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== '' && value !== undefined && value !== null) {
        acc[key as keyof VehicleMaintenanceFilterParams] = value;
      }
      return acc;
    }, {} as VehicleMaintenanceFilterParams);
    onFilter(cleanedFilters);
  };

  const handleReset = () => {
    setFilters({
      plate_no: '',
      maintenance_type: '',
      date_from: '',
      date_to: '',
    });
    onFilter({});
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '' && v !== undefined);

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 text-gray-700">
          <Search size={20} />
          <span className="font-medium">Filter Maintenance Records</span>
        </div>
        {hasActiveFilters && (
          <button onClick={handleReset} className="text-sm text-red-600 hover:text-red-800 flex items-center">
            <X size={16} className="mr-1" />
            Clear Filters
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plate Number</label>
            <input
              type="text"
              name="plate_no"
              value={filters.plate_no || ''}
              onChange={handleChange}
              placeholder="Search by plate..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 uppercase"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Type</label>
            <select
              name="maintenance_type"
              value={filters.maintenance_type || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              {MAINTENANCE_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
            <input
              type="date"
              name="date_from"
              value={filters.date_from || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
            <input
              type="date"
              name="date_to"
              value={filters.date_to || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end mt-4 space-x-2">
          {hasActiveFilters && (
            <button type="button" onClick={handleReset} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              Clear
            </button>
          )}
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Apply Filters
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleMaintenanceFilters;