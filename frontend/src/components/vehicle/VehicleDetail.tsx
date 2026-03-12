import React, { useState } from 'react';
import { VehicleDetail as VehicleDetailType } from '../../types/vehicle';
import { vehicleService } from '../../services/vehicle.service';
import { toast } from 'sonner';
import { AddVehicleModal } from './AddVehicleModal';

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
  
  // Location form state
  const [locationForm, setLocationForm] = useState({
    location: vehicle?.location || '',
    vehicle_allocation: vehicle?.vehicle_allocation || ''
  });

  // Compliance form state
  const [complianceForm, setComplianceForm] = useState({
    bolo_expired_date: vehicle?.bolo_expired_date?.split('T')[0] || ''
  });

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
    } finally {
      setUpdating(false);
    }
  };

  const handleFullUpdateSuccess = () => {
    if (onUpdate) onUpdate();
    setShowFullEditModal(false);
  };

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
                          <td className="py-2">${vehicle.original_price.toLocaleString()}</td>
                        </tr>
                      )}
                      {vehicle.total_price && (
                        <tr>
                          <td className="py-2 text-gray-600">Total Price</td>
                          <td className="py-2 font-medium">${vehicle.total_price.toLocaleString()}</td>
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