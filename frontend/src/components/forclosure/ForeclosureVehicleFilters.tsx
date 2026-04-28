import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { ForeclosureVehicleFilters, FilterStatus } from '../../types/ForeclosureVehicle';

interface Props {
  onFilter: (filters: ForeclosureVehicleFilters) => void;
  initialFilters?: ForeclosureVehicleFilters;
  initialExpanded?: boolean;
}

const FilterComponent: React.FC<Props> = ({ 
  onFilter, 
  initialFilters = {},
}) => {
  // Initialize with empty values, properly typed
  const [filters, setFilters] = useState<ForeclosureVehicleFilters>({
    plate_no: '',
    property_owner: '',
    lender_branch: '',
    parking_place: '',
    nearby_branch: '',
    classification: '',
    status: '' as FilterStatus,
    date_into: '',
  });

  // Only update local state when initialFilters changes and they're not empty
  useEffect(() => {
    // Only update if initialFilters has values (not empty)
    if (Object.keys(initialFilters).length > 0) {
      setFilters(prev => ({
        ...prev,
        ...initialFilters
      }));
    } else {
      // If initialFilters is empty, reset to empty values
      setFilters({
        plate_no: '',
        property_owner: '',
        lender_branch: '',
        parking_place: '',
        nearby_branch: '',
        classification: '',
        status: '' as FilterStatus,
        date_into: '',
      });
    }
  }, [initialFilters]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Special handling for status to ensure it matches the FilterStatus type
    if (name === 'status') {
      setFilters(prev => ({ 
        ...prev, 
        [name]: value as FilterStatus 
      }));
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create a clean filters object without empty values
    const cleanedFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      // Only include non-empty values (not empty string, not undefined, not null)
      if (value !== '' && value !== undefined && value !== null) {
        acc[key as keyof ForeclosureVehicleFilters] = value;
      }
      return acc;
    }, {} as ForeclosureVehicleFilters);
    
    console.log('Applying filters:', cleanedFilters);
    onFilter(cleanedFilters);
  };

  const handleReset = () => {
    console.log('Resetting all filters');
    
    // Reset all filters to empty values in local state with proper typing
    const emptyFilters: ForeclosureVehicleFilters = {
      plate_no: '',
      property_owner: '',
      lender_branch: '',
      parking_place: '',
      nearby_branch: '',
      classification: '',
      status: '' as FilterStatus,
      date_into: '',
    };
    
    setFilters(emptyFilters);
    
    // Immediately call onFilter with an empty object to clear all filters in parent
    onFilter({});
  };

  // Check if any filter has a value (for showing clear button)
  const hasActiveFilters = Object.entries(filters).some(([_, value]) => {
    return value !== '' && value !== undefined && value !== null;
  });

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 text-gray-700">
          <Search size={20} />
          <span className="font-medium">Search Filters</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="text-sm text-red-600 hover:text-red-800 flex items-center transition-colors"
            type="button"
          >
            <X size={16} className="mr-1" />
            Clear All Filters
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plate Number
            </label>
            <input
              type="text"
              name="plate_no"
              value={filters.plate_no || ''}
              onChange={handleChange}
              placeholder="Search by plate..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Owner
            </label>
            <input
              type="text"
              name="property_owner"
              value={filters.property_owner || ''}
              onChange={handleChange}
              placeholder="Search by owner..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lender Branch
            </label>
            <input
              type="text"
              name="lender_branch"
              value={filters.lender_branch || ''}
              onChange={handleChange}
              placeholder="Search by branch..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parking Place
            </label>
            <input
              type="text"
              name="parking_place"
              value={filters.parking_place || ''}
              onChange={handleChange}
              placeholder="Search by parking..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* New Filter: Nearby Branch */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nearby Branch
            </label>
            <input
              type="text"
              name="nearby_branch"
              value={filters.nearby_branch || ''}
              onChange={handleChange}
              placeholder="Search by nearby branch..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* New Filter: Classification */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Classification
            </label>
            <select
              name="classification"
              value={filters.classification || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="heavy">Heavy</option>
              <option value="small">Small</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={filters.status || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Into
            </label>
            <input
              type="date"
              name="date_into"
              value={filters.date_into || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </form>
    </div>
  );
};

export default FilterComponent;