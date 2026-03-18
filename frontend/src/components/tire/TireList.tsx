import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, RotateCw, Edit, RefreshCw,  } from 'lucide-react';
import tireService from '../../services/tire.service';
import { 
  Tire, 
  TireFilterParams,
  TIRE_POSITIONS,
  TIRE_STATUS_OPTIONS,
  getPositionColor,
} from '../../types/Tire';
import { TireManagementModal } from './TireManagementModal';
import { TireRotationModal } from './TireRotationModal';

export const TireList: React.FC = () => {
  const [tires, setTires] = useState<Tire[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRotationModal, setShowRotationModal] = useState(false);
  const [selectedTire, setSelectedTire] = useState<Tire | null>(null);
  const [selectedVehicleForRotation, setSelectedVehicleForRotation] = useState<string>('');
  const [filters, setFilters] = useState<TireFilterParams>({
    page: 1,
    limit: 20,
    sort: '-fitted_date'
  });

  useEffect(() => {
    fetchTires();
  }, [filters]);

  const fetchTires = async () => {
    setLoading(true);
    try {
      const response = await tireService.getTires(filters);
      setTires(response.data);
    } catch (error) {
      toast.error('Failed to fetch tires');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (tire: Tire) => {
    setSelectedTire(tire);
    setShowEditModal(true);
  };

  const handleRotate = (tire: Tire) => {
    setSelectedVehicleForRotation(tire.plate_no);
    setShowRotationModal(true);
  };

  const getActiveTiresForVehicle = (plateNo: string): Tire[] => {
    return tires.filter(t => t.plate_no === plateNo && t.status === 'Active');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tire Management</h1>
        <button
          onClick={() => {
            setSelectedTire(null);
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Add New Tire
        </button>
      </div>

      {/* Filters - Simplified */}
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search by plate number"
            className="px-3 py-2 border border-gray-300 rounded-md"
            onChange={(e) => setFilters({ ...filters, plate_no: e.target.value || undefined })}
          />
          <select
            className="px-3 py-2 border border-gray-300 rounded-md"
            onChange={(e) => setFilters({ ...filters, status: e.target.value as any || undefined })}
          >
            <option value="">All Status</option>
            {TIRE_STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            className="px-3 py-2 border border-gray-300 rounded-md"
            onChange={(e) => setFilters({ ...filters, position: e.target.value || undefined })}
          >
            <option value="">All Positions</option>
            {TIRE_POSITIONS.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tire List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plate No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serial No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Make</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fitted KM</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">KM Diff</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost/KM</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={9} className="text-center py-8"><RefreshCw className="animate-spin mx-auto" /></td></tr>
              ) : tires.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-8 text-gray-500">No tires found</td></tr>
              ) : (
                tires.map(tire => (
                  <tr key={tire._id} className={`hover:bg-gray-50 ${getPositionColor(tire.position)}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{tire.plate_no}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">{tire.serial_no}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{tire.make}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{tire.position}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        tire.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {tire.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{tire.fitted_km.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{tire.km_difference?.toLocaleString() || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{tire.cost_per_km?.toFixed(4) || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(tire)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        {tire.status === 'Active' && (
                          <button
                            onClick={() => handleRotate(tire)}
                            className="text-green-600 hover:text-green-800"
                            title="Rotate"
                          >
                            <RotateCw size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <TireManagementModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        vehiclePlate=""
        onSuccess={() => {
          fetchTires();
          setShowAddModal(false);
        }}
      />

      <TireManagementModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTire(null);
        }}
        vehiclePlate={selectedTire?.plate_no || ''}
        tire={selectedTire}
        onSuccess={() => {
          fetchTires();
          setShowEditModal(false);
          setSelectedTire(null);
        }}
      />

      {selectedVehicleForRotation && (
        <TireRotationModal
          isOpen={showRotationModal}
          onClose={() => {
            setShowRotationModal(false);
            setSelectedVehicleForRotation('');
          }}
          vehiclePlate={selectedVehicleForRotation}
          tires={getActiveTiresForVehicle(selectedVehicleForRotation)}
          currentKm={0} // You'll need to get current KM from vehicle
          onSuccess={() => {
            fetchTires();
            setShowRotationModal(false);
            setSelectedVehicleForRotation('');
          }}
        />
      )}
    </div>
  );
};