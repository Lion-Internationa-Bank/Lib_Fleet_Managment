import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, MoreVertical, Edit, LogOut, RefreshCw } from 'lucide-react';
import foreclosureVehicleService from '../services/ForeclosureVehicle.service';
import { 
  ForeclosureVehicle, 
  ForeclosureVehicleFormData,
  ForeclosureVehicleFilters,
  PaginationInfo 
} from '../types/ForeclosureVehicle';
import ForeclosureVehicleModal from '../components/forclosure/ForeclosureVehicleModal';
import FilterComponent from '../components/forclosure/ForeclosureVehicleFilters';
import DatePickerModal from '../components/forclosure/DatePickerModal';

const ForeclosureVehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<ForeclosureVehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<ForeclosureVehicle | null>(null);
  const [datePickerModalOpen, setDatePickerModalOpen] = useState(false);
  const [vehicleToClose, setVehicleToClose] = useState<ForeclosureVehicle | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  });
  
  // Separate state for active filters and base query params
  const [activeFilters, setActiveFilters] = useState<ForeclosureVehicleFilters>({});
  const [queryParams, setQueryParams] = useState<ForeclosureVehicleFilters>({
    page: 1,
    limit: 10,
    sort: '-date_into'
  });
  
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchVehicles();
  }, [queryParams]); // Only depend on queryParams, not activeFilters

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      // Combine query params with active filters
      const params = {
        ...queryParams,
        ...activeFilters
      };
      console.log('Fetching with params:', params); // For debugging
      const response = await foreclosureVehicleService.getVehicles(params);
      setVehicles(response.data);
      setPagination(response.pagination);
      setTotal(response.total);
    } catch (error) {
      toast.error('Failed to fetch foreclosure vehicles');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: ForeclosureVehicleFormData) => {
    try {
      await foreclosureVehicleService.createVehicle(data);
      toast.success('Vehicle created successfully');
      fetchVehicles();
    } catch (error) {
      toast.error('Failed to create vehicle');
      throw error;
    }
  };

  const handleUpdate = async (data: ForeclosureVehicleFormData) => {
    if (!selectedVehicle) return;
    try {
      await foreclosureVehicleService.updateVehicle(selectedVehicle.plate_no, data);
      toast.success('Vehicle updated successfully');
      fetchVehicles();
    } catch (error) {
      toast.error('Failed to update vehicle');
      throw error;
    }
  };

  const handleUpdateDateOut = async (dateOut: string) => {
    if (!vehicleToClose) return;
    try {
      await foreclosureVehicleService.updateDateOut(vehicleToClose.plate_no, dateOut);
      toast.success('Vehicle exit date set successfully');
      fetchVehicles();
      setDatePickerModalOpen(false);
      setVehicleToClose(null);
    } catch (error) {
      toast.error('Failed to update exit date');
    }
  };

  const handleFilter = (newFilters: ForeclosureVehicleFilters) => {
    console.log('Parent received filters:', newFilters);
    
    // Update active filters
    setActiveFilters(newFilters);
    
    // Update query params to reset to page 1 when filtering
    setQueryParams(prev => ({
      ...prev,
      page: 1
    }));
  };

  const handlePageChange = (newPage: number) => {
    setQueryParams(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const openCreateModal = () => {
    setSelectedVehicle(null);
    setModalOpen(true);
  };

  const openEditModal = (vehicle: ForeclosureVehicle) => {
    setSelectedVehicle(vehicle);
    setModalOpen(true);
    setOpenDropdownId(null);
  };

  const openDatePickerModal = (vehicle: ForeclosureVehicle) => {
    setVehicleToClose(vehicle);
    setDatePickerModalOpen(true);
    setOpenDropdownId(null);
  };

  const toggleDropdown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatus = (vehicle: ForeclosureVehicle) => {
    return vehicle.date_out ? 'Closed' : 'Active';
  };

  const getStatusBadgeClass = (status: string) => {
    return status === 'Active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto px-4 py-8" style={{ backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Foreclosure Vehicles</h1>
          <p className="text-sm text-gray-600 mt-1">Total Records: {total}</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Add Vehicle
        </button>
      </div>

      <FilterComponent 
        onFilter={handleFilter} 
        initialExpanded={true} 
        initialFilters={activeFilters}
      />

      <div className="bg-white rounded-lg shadow overflow-hidden">
       <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Plate Number
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Property Owner
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Lender Branch
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Parking Place
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Nearby Branch
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Classification
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Date Into
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Date Out
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Status
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {loading ? (
          <tr>
            <td colSpan={10} className="px-6 py-4 text-center">
              <div className="flex justify-center items-center">
                <RefreshCw size={20} className="animate-spin mr-2" />
                Loading...
              </div>
            </td>
          </tr>
        ) : vehicles.length === 0 ? (
          <tr>
            <td colSpan={10} className="px-6 py-4 text-center text-gray-500">
              No vehicles found
            </td>
          </tr>
        ) : (
          vehicles.map((vehicle) => {
            const status = getStatus(vehicle);
            const isActive = status === 'Active';
            
            return (
              <tr key={vehicle._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {vehicle.plate_no}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {vehicle.property_owner}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {vehicle.lender_branch}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {vehicle.parking_place}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {vehicle.nearby_branch || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${
                    vehicle.classification === 'heavy' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {vehicle.classification || '-'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(vehicle.date_into)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(vehicle.date_out)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(status)}`}>
                    {status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium relative">
                  <button
                    onClick={(e) => toggleDropdown(e, vehicle._id)}
                    className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100"
                    title="Actions"
                  >
                    <MoreVertical size={18} />
                  </button>
                  
                  {openDropdownId === vehicle._id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                      <div className="py-1">
                        <button
                          onClick={() => openEditModal(vehicle)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Edit size={16} className="mr-2" />
                          Edit Vehicle
                        </button>
                        {isActive && (
                          <button
                            onClick={() => openDatePickerModal(vehicle)}
                            className="flex items-center w-full px-4 py-2 text-sm text-green-600 hover:bg-gray-100"
                          >
                            <LogOut size={16} className="mr-2" />
                            Set Exit Date
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{pagination.page}</span> of{' '}
                  <span className="font-medium">{pagination.totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrev}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {[...Array(pagination.totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pagination.page === i + 1
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNext}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      <ForeclosureVehicleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={selectedVehicle ? handleUpdate : handleCreate}
        vehicle={selectedVehicle}
        title={selectedVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
      />

      <DatePickerModal
        isOpen={datePickerModalOpen}
        onClose={() => {
          setDatePickerModalOpen(false);
          setVehicleToClose(null);
        }}
        onConfirm={handleUpdateDateOut}
        title="Set Vehicle Exit Date"
        message="Please select the date and time when the vehicle exited:"
        vehiclePlate={vehicleToClose?.plate_no}
        confirmText="Save Exit Date"
        cancelText="Cancel"
      />
    </div>
  );
};

export default ForeclosureVehicles;