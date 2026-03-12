import React, { useState } from 'react';
import { CreateVehiclePayload, VehicleDetail } from '../../types/vehicle';
import { vehicleService } from '../../services/vehicle.service';
import { toast } from 'sonner';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: VehicleDetail; // Add this for edit mode
  isEditMode?: boolean; // Add this flag
}

// Initial form data for new vehicle
const initialFormData: CreateVehiclePayload = {
  plate_no: '',
  location: '',
  vehicle_allocation: '',
  vehicle_type: '',
  body_color: '',
  manufacturing_year: new Date().getFullYear(),
  vehicle_origin: '',
  title_certificate_no: '',
  vehicle_model: '',
  chassis_no: '',
  engine_no: '',
  seating_capacity: 5,
  pay_load: undefined,
  total_weight: undefined,
  horse_power: undefined,
  no_of_cylinder: undefined,
  cc: undefined,
  drive_type: '',
  fuel_type: 'Petrol',
  tyre_size: '',
  original_price: undefined,
  total_price: undefined,
  delivery_date: '',
  bolo_expired_date: '',
  supplier_company: '',
  current_km: 0,
  last_service_date: '',
  next_service_date: '',
};

// Helper function to map VehicleDetail to CreateVehiclePayload
const mapVehicleToForm = (vehicle: VehicleDetail): CreateVehiclePayload => {
  return {
    plate_no: vehicle.plate_no,
    location: vehicle.location,
    vehicle_allocation: vehicle.vehicle_allocation,
    vehicle_type: vehicle.vehicle_type,
    body_color: vehicle.body_color,
    manufacturing_year: vehicle.manufacturing_year,
    vehicle_origin: vehicle.vehicle_origin,
    title_certificate_no: vehicle.title_certificate_no || '',
    vehicle_model: vehicle.vehicle_model,
    chassis_no: vehicle.chassis_no,
    engine_no: vehicle.engine_no,
    seating_capacity: vehicle.seating_capacity,
    pay_load: vehicle.pay_load,
    total_weight: vehicle.total_weight,
    horse_power: vehicle.horse_power,
    no_of_cylinder: vehicle.no_of_cylinder,
    cc: vehicle.cc,
    drive_type: vehicle.drive_type || '',
    fuel_type: vehicle.fuel_type as 'Diesel' | 'Regular' | 'Octane' | 'Petrol',
    tyre_size: vehicle.tyre_size,
    original_price: vehicle.original_price,
    total_price: vehicle.total_price,
    delivery_date: vehicle.delivery_date || '',
    bolo_expired_date: vehicle.bolo_expired_date,
    supplier_company: vehicle.supplier_company || '',
    current_km: vehicle.current_km,
    last_service_date: vehicle.last_service_date || '',
    next_service_date: vehicle.next_service_date || '',
  };
};

export const AddVehicleModal: React.FC<AddVehicleModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  editData,
  isEditMode = false 
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateVehiclePayload>(() => {
    if (isEditMode && editData) {
      return mapVehicleToForm(editData);
    }
    return initialFormData;
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Handle number inputs
    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? undefined : Number(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (isEditMode && editData) {
        response = await vehicleService.updateVehicleFull(editData.plate_no, formData);
        toast.success(response.message || 'Vehicle updated successfully');
      } else {
        response = await vehicleService.createVehicle(formData);
        toast.success(response.message || 'Vehicle created successfully');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Failed to save vehicle:', error);
      const errorMessage = 
        error?.response?.data?.message || 
        error?.message || 
        `Failed to ${isEditMode ? 'update' : 'create'} vehicle`;
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl z-50 overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditMode ? 'Edit Vehicle' : 'Add New Vehicle'}
          </h2>
          <button
            onClick={onClose}
            className="text-2xl px-3 py-1 rounded hover:bg-gray-100 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="col-span-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Basic Information</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plate Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="plate_no"
                value={formData.plate_no}
                onChange={handleChange}
                required
                disabled={isEditMode} // Disable plate number in edit mode
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="ABC-123456"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Addis Ababa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Allocation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="vehicle_allocation"
                value={formData.vehicle_allocation}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Head Office Pool"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Type <span className="text-red-500">*</span>
              </label>
              <select
                name="vehicle_type"
                value={formData.vehicle_type}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Type</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Truck">Truck</option>
                <option value="Van">Van</option>
                <option value="Bus">Bus</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Model <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="vehicle_model"
                value={formData.vehicle_model}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Toyota Corolla"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Body Color <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="body_color"
                value={formData.body_color}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Silver"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Manufacturing Year <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="manufacturing_year"
                value={formData.manufacturing_year}
                onChange={handleChange}
                required
                min="1900"
                max={new Date().getFullYear() + 1}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Origin <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="vehicle_origin"
                value={formData.vehicle_origin}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Japan"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title Certificate No
              </label>
              <input
                type="text"
                name="title_certificate_no"
                value={formData.title_certificate_no}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="T-123456789"
              />
            </div>

            {/* Engine & Chassis */}
            <div className="col-span-2 mt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Engine & Chassis</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chassis No <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="chassis_no"
                value={formData.chassis_no}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="JTLBA46P7NN000123"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Engine No <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="engine_no"
                value={formData.engine_no}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1ZRFE123456"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fuel Type <span className="text-red-500">*</span>
              </label>
              <select
                name="fuel_type"
                value={formData.fuel_type}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Regular">Regular</option>
                <option value="Octane">Octane</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Seating Capacity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="seating_capacity"
                value={formData.seating_capacity}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Horse Power
              </label>
              <input
                type="number"
                name="horse_power"
                value={formData.horse_power || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                No of Cylinders
              </label>
              <input
                type="number"
                name="no_of_cylinder"
                value={formData.no_of_cylinder || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CC
              </label>
              <input
                type="number"
                name="cc"
                value={formData.cc || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Drive Type
              </label>
              <select
                name="drive_type"
                value={formData.drive_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Drive Type</option>
                <option value="FWD">FWD</option>
                <option value="RWD">RWD</option>
                <option value="AWD">AWD</option>
                <option value="4WD">4WD</option>
              </select>
            </div>

            {/* Weight & Dimensions */}
            <div className="col-span-2 mt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Weight & Dimensions</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pay Load (kg)
              </label>
              <input
                type="number"
                name="pay_load"
                value={formData.pay_load || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Weight (kg)
              </label>
              <input
                type="number"
                name="total_weight"
                value={formData.total_weight || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tyre Size <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="tyre_size"
                value={formData.tyre_size}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="205/55 R16"
              />
            </div>

            {/* Pricing */}
            <div className="col-span-2 mt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Pricing</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Original Price (Birr)
              </label>
              <input
                type="number"
                name="original_price"
                value={formData.original_price || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Price (Birr)
              </label>
              <input
                type="number"
                name="total_price"
                value={formData.total_price || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier Company
              </label>
              <input
                type="text"
                name="supplier_company"
                value={formData.supplier_company}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ethio Motors PLC"
              />
            </div>

            {/* Dates */}
            <div className="col-span-2 mt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Dates</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Date
              </label>
              <input
                type="date"
                name="delivery_date"
                value={formData.delivery_date ? formData.delivery_date.split('T')[0] : ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                BOLO Expiry Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="bolo_expired_date"
                value={formData.bolo_expired_date ? formData.bolo_expired_date.split('T')[0] : ''}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status */}
            <div className="col-span-2 mt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Status</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current KM
              </label>
              <input
                type="number"
                name="current_km"
                value={formData.current_km}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Service Date
              </label>
              <input
                type="date"
                name="last_service_date"
                value={formData.last_service_date ? formData.last_service_date.split('T')[0] : ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Next Service Date
              </label>
              <input
                type="date"
                name="next_service_date"
                value={formData.next_service_date ? formData.next_service_date.split('T')[0] : ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-8 pt-4 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Vehicle' : 'Create Vehicle')}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};