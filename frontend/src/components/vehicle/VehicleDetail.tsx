import React, { useState, useEffect } from 'react';
import { VehicleDetail as VehicleDetailType } from '../../types/vehicle';
import { vehicleService } from '../../services/vehicle.service';
import { tireService} from '../../services/tire.service';
import { toast } from 'sonner';
import { AddVehicleModal } from './AddVehicleModal';
import { TireManagementModal} from '../tire/TireManagementModal';
import { TireRotationModal } from '../tire/TireRotationModal';
import { 
  Plus, RotateCw, AlertCircle, 
  Wrench,  History 
} from 'lucide-react';
import { 
  getPositionColor,  
  formatCurrency, 
  calculateTireLife,
  Tire
} from '../../types/Tire';

interface VehicleDetailProps {
  vehicle: VehicleDetailType | null;
  loading: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export const VehicleDetail: React.FC<VehicleDetailProps> = ({ 
  vehicle, 
  loading, 
  onClose,
  onUpdate 
}) => {
  const [editingLocation, setEditingLocation] = useState(false);
  const [editingCompliance, setEditingCompliance] = useState(false);
  const [showFullEditModal, setShowFullEditModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  // Tire states
  const [tires, setTires] = useState<Tire[]>([]);
  const [loadingTires, setLoadingTires] = useState(false);
  const [showTireModal, setShowTireModal] = useState(false);
  const [showRotationModal, setShowRotationModal] = useState(false);
  const [selectedTire, setSelectedTire] = useState<Tire | null>(null);
  const [showTireHistory, setShowTireHistory] = useState(false);
  
  // Location form state
  const [locationForm, setLocationForm] = useState({
    location: vehicle?.location || '',
    vehicle_allocation: vehicle?.vehicle_allocation || ''
  });

  // Compliance form state
  const [complianceForm, setComplianceForm] = useState({
    bolo_expired_date: vehicle?.bolo_expired_date?.split('T')[0] || ''
  });

  // Load tires when vehicle is loaded
  useEffect(() => {
    if (vehicle?.plate_no) {
      fetchTires();
    }
  }, [vehicle]);

  const fetchTires = async () => {
    if (!vehicle?.plate_no) return;
    
    setLoadingTires(true);
    try {
      const response = await tireService.getTiresByVehicle(vehicle.plate_no, { include_history: 'true' });
      setTires(response.data);
    } catch (error) {
      console.error('Failed to fetch tires:', error);
      toast.error('Failed to load tire information');
    } finally {
      setLoadingTires(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleLocationUpdate = async () => {
    if (!vehicle) return;
    
    setUpdating(true);
    try {
      const response = await vehicleService.updateVehicleLocation(vehicle.plate_no, locationForm);
      toast.success(response.message);
      if (onUpdate) onUpdate();
      setEditingLocation(false);
    } catch (error) {
      console.error('Failed to update location:', error);
      toast.error('Failed to update location');
    } finally {
      setUpdating(false);
    }
  };

  const handleComplianceUpdate = async () => {
    if (!vehicle) return;
    
    setUpdating(true);
    try {
      const response = await vehicleService.updateVehicleCompliance(vehicle.plate_no, complianceForm);
      toast.success(response.message);
      if (onUpdate) onUpdate();
      setEditingCompliance(false);
    } catch (error) {
      console.error('Failed to update compliance:', error);
      toast.error('Failed to update compliance');
    } finally {
      setUpdating(false);
    }
  };

  const handleFullUpdateSuccess = () => {
    if (onUpdate) onUpdate();
    setShowFullEditModal(false);
  };

  const handleTireUpdateSuccess = () => {
    fetchTires();
  };

  // Group tires by status
  const activeTires = tires.filter(t => t.status === 'Active');
  const wornOutTires = tires.filter(t => t.status === 'Worn Out');

  if (!vehicle && !loading) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 right-0 w-1/2 h-full bg-white shadow-lg z-50 
        overflow-y-auto transition-transform duration-300 ease-in-out
        ${vehicle ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Vehicle Details</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFullEditModal(true)}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Full Edit
            </button>
            <button
              onClick={onClose}
              className="text-2xl px-3 py-1 rounded hover:bg-gray-100 transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-10 text-gray-500">Loading details...</div>
          ) : vehicle && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-base font-semibold text-gray-800 mb-4">Basic Information</h3>
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="py-2 text-gray-600 w-2/5">Plate Number</td>
                      <td className="py-2 font-medium">{vehicle.plate_no}</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-600">Model</td>
                      <td className="py-2">{vehicle.vehicle_model}</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-600">Type</td>
                      <td className="py-2">{vehicle.vehicle_type}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Location & Allocation - Editable */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-base font-semibold text-gray-800">Location & Allocation</h3>
                  {!editingLocation && (
                    <button
                      onClick={() => {
                        setLocationForm({
                          location: vehicle.location,
                          vehicle_allocation: vehicle.vehicle_allocation
                        });
                        setEditingLocation(true);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                  )}
                </div>

                {editingLocation ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Location</label>
                      <input
                        type="text"
                        value={locationForm.location}
                        onChange={(e) => setLocationForm(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Allocation</label>
                      <input
                        type="text"
                        value={locationForm.vehicle_allocation}
                        onChange={(e) => setLocationForm(prev => ({ ...prev, vehicle_allocation: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={handleLocationUpdate}
                        disabled={updating}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        {updating ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => setEditingLocation(false)}
                        className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <table className="w-full">
                    <tbody>
                      <tr>
                        <td className="py-2 text-gray-600 w-2/5">Location</td>
                        <td className="py-2 font-medium">{vehicle.location}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-600">Allocation</td>
                        <td className="py-2">{vehicle.vehicle_allocation}</td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>

              {/* Compliance - Editable */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-base font-semibold text-gray-800">Compliance</h3>
                  {!editingCompliance && (
                    <button
                      onClick={() => {
                        setComplianceForm({
                          bolo_expired_date: vehicle.bolo_expired_date?.split('T')[0] || ''
                        });
                        setEditingCompliance(true);
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                  )}
                </div>

                {editingCompliance ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">BOLO Expiry Date</label>
                      <input
                        type="date"
                        value={complianceForm.bolo_expired_date}
                        onChange={(e) => setComplianceForm({ bolo_expired_date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={handleComplianceUpdate}
                        disabled={updating}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        {updating ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => setEditingCompliance(false)}
                        className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <table className="w-full">
                    <tbody>
                      <tr>
                        <td className="py-2 text-gray-600 w-2/5">BOLO Expiry</td>
                        <td className="py-2 font-medium">{formatDate(vehicle.bolo_expired_date)}</td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>

          

              {/* Technical Specifications */}
              <div>
                <h3 className="text-base font-semibold text-gray-800 mb-4">Technical Specifications</h3>
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="py-2 text-gray-600 w-2/5">Chassis No</td>
                      <td className="py-2 font-mono">{vehicle.chassis_no}</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-600">Engine No</td>
                      <td className="py-2 font-mono">{vehicle.engine_no}</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-600">Fuel Type</td>
                      <td className="py-2">{vehicle.fuel_type}</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-600">Seating Capacity</td>
                      <td className="py-2">{vehicle.seating_capacity}</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-600">Manufacturing Year</td>
                      <td className="py-2">{vehicle.manufacturing_year}</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-600">Body Color</td>
                      <td className="py-2">
                        <span 
                          className="inline-block w-4 h-4 rounded mr-2 align-middle border border-gray-300"
                          style={{ backgroundColor: vehicle.body_color.toLowerCase() }}
                        />
                        {vehicle.body_color}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-600">Tyre Size</td>
                      <td className="py-2">{vehicle.tyre_size}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Engine & Performance */}
              <div>
                <h3 className="text-base font-semibold text-gray-800 mb-4">Engine & Performance</h3>
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="py-2 text-gray-600 w-2/5">Horse Power</td>
                      <td className="py-2">{vehicle.horse_power || 'N/A'} HP</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-600">No. of Cylinders</td>
                      <td className="py-2">{vehicle.no_of_cylinder || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-600">CC</td>
                      <td className="py-2">{vehicle.cc || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-600">Drive Type</td>
                      <td className="py-2">{vehicle.drive_type || 'N/A'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Status & Dates */}
              <div>
                <h3 className="text-base font-semibold text-gray-800 mb-4">Status & Dates</h3>
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="py-2 text-gray-600 w-2/5">Current KM</td>
                      <td className="py-2 font-medium">{vehicle.current_km.toLocaleString()} km</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-600">Last Service</td>
                      <td className="py-2">{formatDate(vehicle.last_service_date)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-600">Next Service</td>
                      <td className="py-2 font-medium">{formatDate(vehicle.next_service_date)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-600">Delivery Date</td>
                      <td className="py-2">{formatDate(vehicle.delivery_date)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Pricing */}
              {(vehicle.original_price || vehicle.total_price) && (
                <div>
                  <h3 className="text-base font-semibold text-gray-800 mb-4">Pricing</h3>
                  <table className="w-full">
                    <tbody>
                      {vehicle.original_price && (
                        <tr>
                          <td className="py-2 text-gray-600 w-2/5">Original Price</td>
                          <td className="py-2">{formatCurrency(vehicle.original_price)}</td>
                        </tr>
                      )}
                      {vehicle.total_price && (
                        <tr>
                          <td className="py-2 text-gray-600">Total Price</td>
                          <td className="py-2 font-medium">{formatCurrency(vehicle.total_price)}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Supplier */}
              {vehicle.supplier_company && (
                <div>
                  <h3 className="text-base font-semibold text-gray-800 mb-4">Supplier Information</h3>
                  <table className="w-full">
                    <tbody>
                      <tr>
                        <td className="py-2 text-gray-600 w-2/5">Supplier</td>
                        <td className="py-2">{vehicle.supplier_company}</td>
                      </tr>
                      {vehicle.title_certificate_no && (
                        <tr>
                          <td className="py-2 text-gray-600">Title Certificate</td>
                          <td className="py-2">{vehicle.title_certificate_no}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Documents */}
              {vehicle.file_uploads && vehicle.file_uploads.length > 0 && (
                <div>
                  <h3 className="text-base font-semibold text-gray-800 mb-4">Documents</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    {vehicle.file_uploads.map((file: string, index: number) => (
                      <li key={index}>
                        <a 
                          href={file} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                          📄 Document {index + 1}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

 {/* Tires Section */}
<div className="bg-gray-50 p-4 rounded-lg">
  <div className="flex justify-between items-center mb-3">
    <h3 className="text-base font-semibold text-gray-800 flex items-center">
      <Wrench className="mr-2 text-gray-600" size={18} />
      Tires
    </h3>
    <div className="flex gap-2">
      <button
        onClick={() => setShowRotationModal(true)}
        disabled={activeTires.length < 2}
        className={`text-sm flex items-center gap-1 px-2 py-1 rounded ${
          activeTires.length >= 2 
            ? 'text-green-600 hover:text-green-800 hover:bg-green-50' 
            : 'text-gray-400 cursor-not-allowed'
        }`}
        title={activeTires.length < 2 ? "Need at least 2 active tires to rotate" : "Rotate tires"}
      >
        <RotateCw size={16} />
        Rotate
      </button>
      <button
        onClick={() => {
          setSelectedTire(null);
          setShowTireModal(true);
        }}
        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50"
      >
        <Plus size={16} />
        Add Tire
      </button>
    </div>
  </div>

  {loadingTires ? (
    <div className="text-center py-4 text-gray-500">Loading tires...</div>
  ) : tires.length === 0 ? (
    <div className="text-center py-6 bg-white rounded-lg border border-dashed border-gray-300">
      <AlertCircle size={24} className="mx-auto mb-2 text-gray-400" />
      <p className="text-sm text-gray-500 mb-3">No tires recorded for this vehicle</p>
      <button
        onClick={() => {
          setSelectedTire(null);
          setShowTireModal(true);
        }}
        className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
      >
        Add First Tire
      </button>
    </div>
  ) : (
    <div className="space-y-4">
      {/* Active Tires */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium text-gray-700">
            Active Tires ({activeTires.length})
          </h4>
          {activeTires.length > 0 && (
            <button
              onClick={() => setShowTireHistory(!showTireHistory)}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <History size={14} />
              {showTireHistory ? 'Hide Details' : 'Show Details'}
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {activeTires
            .sort((a, b) => a.position.localeCompare(b.position))
            .map(tire => {
              const tireLife = calculateTireLife(tire);
              return (
                <div
                  key={tire._id}
                  className={`bg-white p-3 rounded-lg border ${getPositionColor(tire.position)} shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
                  onClick={() => {
                    setSelectedTire(tire);
                    setShowTireModal(true);
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      {tire.position}
                    </span>
                    <span className="text-xs text-gray-500">{tire.serial_no}</span>
                  </div>
                  <div className="text-xs space-y-1">
                    <p><span className="text-gray-500">Make:</span> {tire.make}</p>
                    <p><span className="text-gray-500">Fitted Date:</span> {formatDate(tire.fitted_date)}</p>
                    <p><span className="text-gray-500">Fitted KM:</span> {tire.fitted_km.toLocaleString()} km</p>
                    <p><span className="text-gray-500">Price:</span> {formatCurrency(tire.unit_price)}</p>
                    
                    {/* Tire Life Indicator - Only shows when showTireHistory is true */}
                    {showTireHistory && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        {tire.cost_per_km && (
                          <div className="flex justify-between text-gray-600 mb-1">
                            <span>Cost/KM:</span>
                            <span className="font-medium">{tire.cost_per_km.toFixed(4)}</span>
                          </div>
                        )}
                        <div className="mt-1">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Life Used</span>
                            <span>{tireLife.percentage.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full ${
                                tireLife.percentage > 80 ? 'bg-red-500' : 
                                tireLife.percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(100, tireLife.percentage)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Rotation History Count */}
                  {tire.rotation_history && tire.rotation_history.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-400 flex items-center">
                        <RotateCw size={12} className="mr-1" />
                        Rotated: {tire.rotation_history.length} time(s)
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Worn Out Tires */}
      {wornOutTires.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Worn Out Tires ({wornOutTires.length})
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {wornOutTires
              .sort((a, b) => new Date(b.worn_out_date!).getTime() - new Date(a.worn_out_date!).getTime())
              .map(tire => (
                <div
                  key={tire._id}
                  className="bg-white p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedTire(tire);
                    setShowTireModal(true);
                  }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-sm text-gray-700">{tire.position}</span>
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                      {tire.serial_no}
                    </span>
                  </div>
                  
                  {/* Main Worn Out Info */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-red-50 p-2 rounded">
                      <span className="text-gray-500 block">Worn Out Date</span>
                      <span className="font-medium text-red-700">{formatDate(tire.worn_out_date?? '' )}</span>
                    </div>
                    <div className="bg-red-50 p-2 rounded">
                      <span className="text-gray-500 block">Worn Out KM</span>
                      <span className="font-medium text-red-700">{tire.worn_out_km?.toLocaleString()} km</span>
                    </div>
                  </div>

                  {/* Additional Details - Only show when showTireHistory is true */}
                  {showTireHistory && (
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-500">Make:</span>
                          <span className="ml-1 font-medium">{tire.make}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">KM Used:</span>
                          <span className="ml-1 font-medium">{tire.km_difference?.toLocaleString()} km</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Cost/KM:</span>
                          <span className="ml-1 font-medium">{tire.cost_per_km?.toFixed(4)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Fitted:</span>
                          <span className="ml-1 font-medium">{formatDate(tire.fitted_date)}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">Fitted KM:</span>
                          <span className="ml-1 font-medium">{tire.fitted_km.toLocaleString()} km</span>
                        </div>
                      </div>
                      
                      {tire.reason_for_change && (
                        <div className="mt-2 p-2 bg-yellow-50 rounded text-xs">
                          <span className="text-gray-600">Reason:</span>
                          <p className="text-gray-700 mt-1">{tire.reason_for_change}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Minimal view when details are hidden */}
                  {!showTireHistory && tire.reason_for_change && (
                    <div className="mt-2 text-xs text-gray-500 truncate">
                      Reason: {tire.reason_for_change}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )}
</div>

              {/* System Info */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-400">
                  Created: {new Date(vehicle.createdAt).toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Last Updated: {new Date(vehicle.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tire Management Modal */}
      {vehicle && (
        <TireManagementModal
          isOpen={showTireModal}
          onClose={() => {
            setShowTireModal(false);
            setSelectedTire(null);
          }}
          vehiclePlate={vehicle.plate_no}
          tire={selectedTire}
          onSuccess={handleTireUpdateSuccess}
        />
      )}

      {/* Tire Rotation Modal */}
      {vehicle && activeTires.length >= 2 && (
        <TireRotationModal
          isOpen={showRotationModal}
          onClose={() => setShowRotationModal(false)}
          vehiclePlate={vehicle.plate_no}
          tires={activeTires}
          currentKm={vehicle.current_km}
          onSuccess={() => {
            fetchTires();
            if (onUpdate) onUpdate();
          }}
        />
      )}

      {/* Full Edit Modal */}
      {vehicle && (
        <AddVehicleModal
          isOpen={showFullEditModal}
          onClose={() => setShowFullEditModal(false)}
          onSuccess={handleFullUpdateSuccess}
          editData={vehicle}
          isEditMode={true}
        />
      )}
    </>
  );
};