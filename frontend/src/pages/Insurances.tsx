import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Plus, MoreVertical, Edit, Eye, RefreshCw, Shield,
  Calendar, Bell, AlertTriangle, CheckCircle
} from 'lucide-react';
import insuranceService from '../services/insurance.service';
import { 
  Insurance, 
  InsuranceFormData,
  InsuranceFilterParams,
  formatDate,
  calculateDaysRemaining,
  getInsuranceStatus,
  getReminderStatus
} from '../types/Insurance';
import InsuranceFilters from '../components/insurance/InsuranceFiltes';
import InsuranceModal from '../components/insurance/InsuranceModal';
import InsuranceDetailModal from '../components/insurance/InsuranceDatailModal';

const Insurances: React.FC = () => {
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInsurance, setSelectedInsurance] = useState<Insurance | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [viewingInsurance, setViewingInsurance] = useState<Insurance | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchInsurances();
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdownId(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchInsurances = async () => {
    try {
      setLoading(true);
      const response = await insuranceService.getInsurances();
      setInsurances(response.data);
      setTotal(response.count || response.data.length);
    } catch (error) {
      toast.error('Failed to fetch insurance records');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: InsuranceFormData) => {
    try {
      await insuranceService.createInsurance(data);
      toast.success('Insurance record created successfully');
      fetchInsurances();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create record';
      toast.error(message);
      throw error;
    }
  };

  const handleUpdate = async (data: InsuranceFormData) => {
    if (!selectedInsurance) return;
    try {
      await insuranceService.updateInsurance(selectedInsurance._id, data);
      toast.success('Insurance record updated successfully');
      fetchInsurances();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update record';
      toast.error(message);
      throw error;
    }
  };

  const handleFilter = async (filters: InsuranceFilterParams) => {
    try {
      setLoading(true);
      const response = await insuranceService.getInsurances(filters);
      setInsurances(response.data);
      setTotal(response.count || response.data.length);
    } catch (error) {
      toast.error('Failed to fetch insurance records');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setSelectedInsurance(null);
    setModalOpen(true);
  };

  const openEditModal = (insurance: Insurance) => {
    setSelectedInsurance(insurance);
    setModalOpen(true);
    setOpenDropdownId(null);
  };

  const openDetailModal = (insurance: Insurance) => {
    setViewingInsurance(insurance);
    setDetailModalOpen(true);
    setOpenDropdownId(null);
  };

  const toggleDropdown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <CheckCircle size={14} className="mr-1 text-green-600" />;
      case 'Attention':
      case 'Warning':
        return <Bell size={14} className="mr-1 text-yellow-600" />;
      case 'Critical':
      case 'Expired':
        return <AlertTriangle size={14} className="mr-1 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Insurance Records</h1>
          <p className="text-sm text-gray-600 mt-1">Total Records: {total}</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Add Insurance
        </button>
      </div>

      <InsuranceFilters onFilter={handleFilter} />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Insurance Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Renewal Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reminder Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days Left
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <RefreshCw size={20} className="animate-spin mr-2" />
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : insurances.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    <Shield size={40} className="mx-auto mb-2 text-gray-400" />
                    No insurance records found
                  </td>
                </tr>
              ) : (
                insurances.map((insurance) => {
                  const daysRemaining = calculateDaysRemaining(insurance.insurance_expired_date);
                  const status = getInsuranceStatus(insurance.insurance_expired_date);
                  const reminderStatus = getReminderStatus(insurance.reminder_date);
                  
                  return (
                    <tr key={insurance._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          <Shield size={16} className="mr-2 text-gray-400" />
                          {insurance.insurance_provider}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-1 text-gray-400" />
                          {formatDate(insurance.insurance_renewal_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-1 text-gray-400" />
                          {formatDate(insurance.insurance_expired_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {insurance.reminder_date ? (
                          <div className="flex items-center">
                            <Bell size={14} className="mr-1 text-gray-400" />
                            {formatDate(insurance.reminder_date)}
                            {reminderStatus && (
                              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${reminderStatus.color}`}>
                                {reminderStatus.label}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">Not set</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex items-center text-xs rounded-full ${status.color}`}>
                          {getStatusIcon(status.label)}
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {daysRemaining >= 0 ? (
                          <span className={daysRemaining <= 7 ? 'text-red-600 font-medium' : ''}>
                            {daysRemaining} days
                          </span>
                        ) : (
                          <span className="text-red-600 font-medium">Expired</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openDetailModal(insurance)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <div className="relative">
                            <button
                              onClick={(e) => toggleDropdown(e, insurance._id)}
                              className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100 transition-colors"
                              title="More Actions"
                            >
                              <MoreVertical size={18} />
                            </button>
                            {openDropdownId === insurance._id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                <div className="py-1">
                                  <button
                                    onClick={() => openEditModal(insurance)}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                  >
                                    <Edit size={16} className="mr-2" />
                                    Edit Insurance
                                  </button>
                                </div>
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
      </div>

      <InsuranceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={selectedInsurance ? handleUpdate : handleCreate}
        insurance={selectedInsurance}
        title={selectedInsurance ? 'Edit Insurance' : 'Add New Insurance'}
      />

      <InsuranceDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setViewingInsurance(null);
        }}
        insurance={viewingInsurance}
      />
    </div>
  );
};

export default Insurances;