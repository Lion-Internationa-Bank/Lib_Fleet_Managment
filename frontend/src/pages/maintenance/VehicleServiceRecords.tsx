import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Plus, MoreVertical, Edit, Eye, RefreshCw, Wrench,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
} from 'lucide-react';
import maintenanceService from '../../services/maintenance.service';
import { 
  VehicleMaintenance, 
  VehicleMaintenanceFormData,
  VehicleMaintenanceFilterParams,
  PaginationInfo,
  getMaintenanceTypeColor
} from '../../types/Maintenance';
import VehicleMaintenanceFilters from '../../components/maintenance/VehicleMaintenanceFilters';
import VehicleMaintenanceModal from '../../components/maintenance/VehicleMaintenanceModal';
import VehicleMaintenanceDetailModal from '../../components/maintenance/VehicleMaintenanceDetailModal';

const VehicleServiceRecords: React.FC = () => {
  const [records, setRecords] = useState<VehicleMaintenance[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<VehicleMaintenance | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<VehicleMaintenance | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  });
  
  const [activeFilters, setActiveFilters] = useState<VehicleMaintenanceFilterParams>({});
  const [queryParams, setQueryParams] = useState<VehicleMaintenanceFilterParams>({
    page: 1,
    limit: 20,
    sort: '-date_out'
  });
  
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchRecords();
  }, [queryParams]);

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdownId(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params = {
        ...queryParams,
        ...activeFilters
      };
      const response = await maintenanceService.getRecords(params);
      setRecords(response.data);
      setPagination(response.pagination);
      setTotal(response.total);
    } catch (error) {
      toast.error('Failed to fetch maintenance records');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: VehicleMaintenanceFormData) => {
    try {
      await maintenanceService.createRecord(data);
      toast.success('Maintenance record created successfully');
      fetchRecords();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create record';
      toast.error(message);
      throw error;
    }
  };

  const handleUpdate = async (data: VehicleMaintenanceFormData) => {
    if (!selectedRecord) return;
    try {
      await maintenanceService.updateRecord(selectedRecord._id, data);
      toast.success('Maintenance record updated successfully');
      fetchRecords();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update record';
      toast.error(message);
      throw error;
    }
  };

  const handleFilter = (newFilters: VehicleMaintenanceFilterParams) => {
    setActiveFilters(newFilters);
    setQueryParams(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setQueryParams(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = Number(e.target.value);
    setQueryParams(prev => ({ ...prev, limit: newLimit, page: 1 }));
  };

  const openCreateModal = () => {
    setSelectedRecord(null);
    setModalOpen(true);
  };

  const openEditModal = (record: VehicleMaintenance) => {
    setSelectedRecord(record);
    setModalOpen(true);
    setOpenDropdownId(null);
  };

  const openDetailModal = (record: VehicleMaintenance) => {
    setViewingRecord(record);
    setDetailModalOpen(true);
    setOpenDropdownId(null);
  };

  const toggleDropdown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const formatCurrency = (value: number) => {
    return `ETB ${value.toFixed(2)}`;
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehicle Maintenance Records</h1>
          <p className="text-sm text-gray-600 mt-1">Total Records: {total}</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus size={20} className="mr-2" />
          Add Maintenance Record
        </button>
      </div>

      <VehicleMaintenanceFilters onFilter={handleFilter} />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plate No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">KM at Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">KM Diff</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost/KM</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={9} className="px-6 py-4 text-center"><RefreshCw size={20} className="animate-spin mx-auto" /> Loading...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={9} className="px-6 py-4 text-center text-gray-500"><Wrench size={40} className="mx-auto mb-2" />No maintenance records found</td></tr>
              ) : (
                records.map((record) => {
                  const typeColor = getMaintenanceTypeColor(record.maintenance_type);
                  return (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.plate_no}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.invoice_no}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(record.date_out) }</td>
                      <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 py-1 text-xs rounded-full ${typeColor}`}>{record.maintenance_type}</span></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.km_at_service?.toLocaleString()?? "undefined"} km</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(record.total_cost)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.km_diff ? `${record.km_diff.toLocaleString()} km` : '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.cost_per_km ? formatCurrency(record.cost_per_km) : '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button onClick={() => openDetailModal(record)} className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50" title="View Details"><Eye size={18} /></button>
                          <div className="relative">
                            <button onClick={(e) => toggleDropdown(e, record._id)} className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100"><MoreVertical size={18} /></button>
                            {openDropdownId === record._id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                                <button onClick={() => openEditModal(record)} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                  <Edit size={16} className="mr-2" /> Edit Record
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
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
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t">
            <div className="flex items-center space-x-2">
              <span className="text-sm">Show</span>
              <select value={queryParams.limit} onChange={handleLimitChange} className="border rounded-md text-sm px-2 py-1">
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm">entries</span>
            </div>
            <div className="flex items-center space-x-2">
              <button onClick={() => handlePageChange(1)} disabled={!pagination.hasPrev} className="p-2 border rounded-md disabled:opacity-50"><ChevronsLeft size={16} /></button>
              <button onClick={() => handlePageChange(pagination.page - 1)} disabled={!pagination.hasPrev} className="p-2 border rounded-md disabled:opacity-50"><ChevronLeft size={16} /></button>
              <span className="text-sm">Page {pagination.page} of {pagination.totalPages}</span>
              <button onClick={() => handlePageChange(pagination.page + 1)} disabled={!pagination.hasNext} className="p-2 border rounded-md disabled:opacity-50"><ChevronRight size={16} /></button>
              <button onClick={() => handlePageChange(pagination.totalPages)} disabled={!pagination.hasNext} className="p-2 border rounded-md disabled:opacity-50"><ChevronsRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      <VehicleMaintenanceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={selectedRecord ? handleUpdate : handleCreate}
        record={selectedRecord}
        title={selectedRecord ? 'Edit Maintenance Record' : 'Add New Maintenance Record'}
      />

      <VehicleMaintenanceDetailModal
        isOpen={detailModalOpen}
        onClose={() => { setDetailModalOpen(false); setViewingRecord(null); }}
        record={viewingRecord}
      />
    </div>
  );
};

export default VehicleServiceRecords;