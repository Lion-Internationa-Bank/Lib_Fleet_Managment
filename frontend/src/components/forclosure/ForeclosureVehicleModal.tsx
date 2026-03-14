import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { ForeclosureVehicleFormData, ForeclosureVehicle } from '../../types/ForeclosureVehicle';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ForeclosureVehicleFormData) => Promise<void>;
  vehicle?: ForeclosureVehicle | null;
  title: string;
}

const ForeclosureVehicleModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  vehicle, 
  title 
}) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ForeclosureVehicleFormData>({
    defaultValues: {
      plate_no: '',
      property_owner: '',
      lender_branch: '',
      parking_place: '',
      date_into: '',
      date_out: null,
    }
  });

  useEffect(() => {
    if (vehicle) {
      reset({
        plate_no: vehicle.plate_no,
        property_owner: vehicle.property_owner,
        lender_branch: vehicle.lender_branch,
        parking_place: vehicle.parking_place,
        date_into: vehicle.date_into ? new Date(vehicle.date_into).toISOString().slice(0, 16) : '',
        date_out: vehicle.date_out ? new Date(vehicle.date_out).toISOString().slice(0, 16) : null,
      });
    } else {
      reset({
        plate_no: '',
        property_owner: '',
        lender_branch: '',
        parking_place: '',
        date_into: '',
        date_out: null,
      });
    }
  }, [vehicle, reset]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: ForeclosureVehicleFormData) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      toast.error('Failed to save vehicle');
    }
  };

  return (
    <>
      {/* Modal Overlay - semi-transparent but shows background content */}
      <div 
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity z-40"
        onClick={onClose}
      />
      
      {/* Modal Container - centers the modal content */}
      <div className="fixed inset-0 overflow-y-auto z-50">
        <div className="flex min-h-full items-center justify-center p-4">
          {/* Modal Content */}
          <div 
            className="relative bg-white rounded-lg w-full max-w-md p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{title}</h2>
              <button 
                onClick={onClose} 
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plate Number *
                </label>
                <input
                  type="text"
                  {...register('plate_no', { required: 'Plate number is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter plate number"
                />
                {errors.plate_no && (
                  <p className="mt-1 text-sm text-red-600">{errors.plate_no.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Owner *
                </label>
                <input
                  type="text"
                  {...register('property_owner', { required: 'Property owner is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter property owner name"
                />
                {errors.property_owner && (
                  <p className="mt-1 text-sm text-red-600">{errors.property_owner.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lender Branch *
                </label>
                <input
                  type="text"
                  {...register('lender_branch', { required: 'Lender branch is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter lender branch"
                />
                {errors.lender_branch && (
                  <p className="mt-1 text-sm text-red-600">{errors.lender_branch.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parking Place *
                </label>
                <input
                  type="text"
                  {...register('parking_place', { required: 'Parking place is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter parking place"
                />
                {errors.parking_place && (
                  <p className="mt-1 text-sm text-red-600">{errors.parking_place.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Into *
                </label>
                <input
                  type="datetime-local"
                  {...register('date_into', { required: 'Date into is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.date_into && (
                  <p className="mt-1 text-sm text-red-600">{errors.date_into.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Out
                </label>
                <input
                  type="datetime-local"
                  {...register('date_out')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForeclosureVehicleModal;