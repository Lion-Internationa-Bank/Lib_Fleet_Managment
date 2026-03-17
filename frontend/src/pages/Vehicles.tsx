import React, { useState, useEffect } from 'react';
import { vehicleService } from '../services/vehicle.service';
import { VehicleListItem, VehicleDetail as VehicleDetailType, VehicleFilters } from '../types/vehicle';
import { VehicleDetail } from '../components/vehicle/VehicleDetail';
import { toast } from 'sonner';
import { AddVehicleModal } from '../components/vehicle/AddVehicleModal';
import { Eye } from 'lucide-react';


export const Vehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<VehicleListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleDetailType | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  // Filters
  const [filters, setFilters] = useState<VehicleFilters>({
    plate_no: '',
    location: '',
    vehicle_type: '',
    fuel_type: '',
    page: 1,
    limit: 10
  });

  // Fetch vehicles list
  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await vehicleService.getVehicles(filters);
      
      setVehicles(response.data);
      setPagination({
        page: response.pagination.page,
        limit: response.pagination.limit,
        total: response.total,
        totalPages: response.pagination.totalPages
      });
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch single vehicle details
  const fetchVehicleDetail = async (plateNo: string) => {
    setLoadingDetail(true);
    try {
      const response = await vehicleService.getVehicleByPlate(plateNo);
      setSelectedVehicle(response.data);
    } catch (error) {
      console.error('Failed to fetch vehicle details:', error);
      toast.error(`Could not load details for ${plateNo}`);
    } finally {
      setLoadingDetail(false);
    }
  };

    const handleAddSuccess = () => {
    fetchVehicles();
  };

  // Load vehicles on mount and when filters change
  useEffect(() => {
    fetchVehicles();
  }, [filters.page, filters.limit, filters.plate_no, filters.location, filters.vehicle_type, filters.fuel_type]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev: VehicleFilters) => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (key: keyof VehicleFilters, value: string | number) => {
    setFilters((prev: VehicleFilters) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleViewDetails = (plateNo: string) => {
    fetchVehicleDetail(plateNo);
  };

  const closeDetails = () => {
    setSelectedVehicle(null);
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev: VehicleFilters) => ({ ...prev, page: newPage }));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
        {/* Header with Add Button */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vehicle Management</h1>
          <p className="text-gray-600 mt-1">
            {pagination.total} total vehicles
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <span className="text-lg">+</span>
          Add Vehicle
        </button>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by plate number"
          value={filters.plate_no || ''}
          onChange={(e) => handleFilterChange('plate_no', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md min-w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <select
          value={filters.location || ''}
          onChange={(e) => handleFilterChange('location', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md min-w-[150px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Locations</option>
          <option value="Head Office">Head Office</option>
          <option value="City Branch">City Branch</option>
        </select>
        <select
          value={filters.vehicle_type || ''}
          onChange={(e) => handleFilterChange('vehicle_type', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md min-w-[150px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Types</option>
          <option value="Sedan">Sedan</option>
          <option value="SUV">SUV</option>
          <option value="Truck">Truck</option>
        </select>
        <select
          value={filters.fuel_type || ''}
          onChange={(e) => handleFilterChange('fuel_type', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md min-w-[150px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Fuels</option>
          <option value="Diesel">Diesel</option>
          <option value="Regular">Regular</option>
          <option value="Octane">Octane</option>
        </select>
        <select
          value={filters.limit || 10}
          onChange={(e) => handleFilterChange('limit', Number(e.target.value))}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value={10}>10 per page</option>
          <option value={25}>25 per page</option>
          <option value={50}>50 per page</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Search
        </button>
      </form>

      {/* Vehicles List */}
      <div>
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Plate #</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Model</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Location</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Allocation</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Fuel</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">KM</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Next Service</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-10 text-gray-500">
                        No vehicles found
                      </td>
                    </tr>
                  ) : (
                    vehicles.map((vehicle) => (
                      <tr key={vehicle.plate_no} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-medium">{vehicle.plate_no}</td>
                        <td className="py-3 px-4">{vehicle.vehicle_model}</td>
                        <td className="py-3 px-4">{vehicle.vehicle_type}</td>
                        <td className="py-3 px-4">{vehicle.location}</td>
                        <td className="py-3 px-4">{vehicle.vehicle_allocation}</td>
                        <td className="py-3 px-4">{vehicle.fuel_type}</td>
                        <td className="py-3 px-4">{vehicle.current_km.toLocaleString()}</td>
                        <td className="py-3 px-4">{formatDate(vehicle.next_service_date)}</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() =>  handleViewDetails(vehicle.plate_no)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={`px-3 py-1.5 border border-gray-300 rounded-md bg-white ${
                    pagination.page === 1 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-gray-50 cursor-pointer'
                  }`}
                >
                  Previous
                </button>
                <span className="px-3 py-1.5">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className={`px-3 py-1.5 border border-gray-300 rounded-md bg-white ${
                    pagination.page === pagination.totalPages 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-gray-50 cursor-pointer'
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Vehicle Detail Modal - Slides from right */}
<VehicleDetail 
  vehicle={selectedVehicle}
  loading={loadingDetail}
  onClose={closeDetails}
  onUpdate={() => {
    // Refresh the vehicle details after update
    if (selectedVehicle) {
      fetchVehicleDetail(selectedVehicle.plate_no);
    }
    fetchVehicles();
  }}
/>

       <AddVehicleModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
};