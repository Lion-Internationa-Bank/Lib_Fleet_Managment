import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { X, Info, Calendar, Hash, DollarSign, Gauge, Wrench } from 'lucide-react';
import { Tire, TireFormData, TIRE_POSITIONS, formatDate } from '../../types/Tire';
import tireService from '../../services/tire.service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  vehiclePlate: string;
  tire?: Tire | null;
  onSuccess?: () => void;
}

export const TireManagementModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  vehiclePlate,
  tire, 
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);
  const [rotationHistory, setRotationHistory] = useState(false);

  const { register, handleSubmit, reset,  formState: { errors, isSubmitting } } = useForm<TireFormData>({
    defaultValues: {
      plate_no: vehiclePlate,
      make: '',
      serial_no: '',
      ply_rate: 0,
      position: 'Front Left',
      fitted_date: '',
      fitted_km: 0,
      unit_price: 0,
      reason_for_change: '',
    }
  });

  useEffect(() => {
    if (tire) {
      reset({
        plate_no: tire.plate_no,
        make: tire.make,
        serial_no: tire.serial_no,
        ply_rate: tire.ply_rate,
        position: tire.position,
        fitted_date: tire.fitted_date ? new Date(tire.fitted_date).toISOString().split('T')[0] : '',
        fitted_km: tire.fitted_km,
        unit_price: tire.unit_price,
        reason_for_change: tire.reason_for_change || '',
      });
      setRotationHistory(!!tire.rotation_history?.length);
    } else {
      reset({
        plate_no: vehiclePlate,
        make: '',
        serial_no: '',
        ply_rate: 0,
        position: 'Front Left',
        fitted_date: '',
        fitted_km: 0,
        unit_price: 0,
        reason_for_change: '',
      });
      setRotationHistory(false);
    }
  }, [tire, reset, vehiclePlate]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = async (formData: TireFormData) => {
    try {
      setLoading(true);
      
      const dataToSubmit = {
        ...formData,
        plate_no: vehiclePlate,
        ply_rate: Number(formData.ply_rate),
        fitted_km: Number(formData.fitted_km),
        unit_price: Number(formData.unit_price),
      };

      if (tire) {
        await tireService.updateTire(tire._id, dataToSubmit);
        toast.success('Tire updated successfully');
      } else {
        await tireService.createTire(dataToSubmit);
        toast.success('Tire added successfully');
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${tire ? 'update' : 'add'} tire`);
    } finally {
      setLoading(false);
    }
  };

  const isEditMode = !!tire;

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 overflow-y-auto z-50">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-lg w-full max-w-2xl p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b">
              <h2 className="text-xl font-semibold">
                {isEditMode ? 'Edit Tire' : 'Add New Tire'}
              </h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Vehicle Plate - Read Only */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Plate Number
                  </label>
                  <input
                    type="text"
                    value={vehiclePlate}
                    disabled
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700"
                  />
                </div>

                {/* Make */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tire Make <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('make', { required: 'Tire make is required' })}
                    placeholder="e.g., Michelin, Bridgestone"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.make && (
                    <p className="text-xs text-red-600 mt-1">{errors.make.message}</p>
                  )}
                </div>

                {/* Serial Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Serial Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Hash size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      {...register('serial_no', { 
                        required: 'Serial number is required',
                        pattern: {
                          value: /^[A-Za-z0-9-]+$/,
                          message: 'Serial number can only contain letters, numbers, and hyphens'
                        }
                      })}
                      placeholder="e.g., TIRE-001"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 uppercase"
                    />
                  </div>
                  {errors.serial_no && (
                    <p className="text-xs text-red-600 mt-1">{errors.serial_no.message}</p>
                  )}
                </div>

                {/* Ply Rate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ply Rate <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    {...register('ply_rate', { 
                      required: 'Ply rate is required',
                      min: { value: 1, message: 'Ply rate must be at least 1' },
                      valueAsNumber: true
                    })}
                    placeholder="e.g., 12"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.ply_rate && (
                    <p className="text-xs text-red-600 mt-1">{errors.ply_rate.message}</p>
                  )}
                </div>

                {/* Position */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('position', { required: 'Position is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    disabled={isEditMode} // Can't change position of existing tire directly
                  >
                    {TIRE_POSITIONS.map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                  {errors.position && (
                    <p className="text-xs text-red-600 mt-1">{errors.position.message}</p>
                  )}
                  {isEditMode && (
                    <p className="text-xs text-gray-500 mt-1">Use rotation to change position</p>
                  )}
                </div>

                {/* Fitted Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fitted Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="date"
                      {...register('fitted_date', { required: 'Fitted date is required' })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {errors.fitted_date && (
                    <p className="text-xs text-red-600 mt-1">{errors.fitted_date.message}</p>
                  )}
                </div>

                {/* Fitted KM */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fitted KM <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Gauge size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="number"
                      step="0.1"
                      {...register('fitted_km', { 
                        required: 'Fitted KM is required',
                        min: { value: 0, message: 'KM must be positive' },
                        valueAsNumber: true
                      })}
                      placeholder="0"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {errors.fitted_km && (
                    <p className="text-xs text-red-600 mt-1">{errors.fitted_km.message}</p>
                  )}
                </div>

                {/* Unit Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Price (ETB) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      {...register('unit_price', { 
                        required: 'Unit price is required',
                        min: { value: 0, message: 'Price must be positive' },
                        valueAsNumber: true
                      })}
                      placeholder="0.00"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {errors.unit_price && (
                    <p className="text-xs text-red-600 mt-1">{errors.unit_price.message}</p>
                  )}
                </div>

                {/* Reason for Change */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Change
                  </label>
                  <div className="relative">
                    <Wrench size={16} className="absolute left-3 top-3 text-gray-400" />
                    <textarea
                      {...register('reason_for_change')}
                      rows={2}
                      placeholder="e.g., Worn out, Puncture, Damage"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Rotation History (for existing tires) */}
              {rotationHistory && tire && tire.rotation_history.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                    <Info size={16} className="mr-1" />
                    Rotation History
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {tire.rotation_history.map((rotation, idx) => (
                      <div key={idx} className="text-xs bg-white p-2 rounded border border-blue-100">
                        <div className="flex justify-between">
                          <span className="font-medium">{rotation.from_position} → {rotation.to_position}</span>
                          <span className="text-gray-500">{formatDate(rotation.rotation_date)}</span>
                        </div>
                        <div className="flex justify-between mt-1 text-gray-600">
                          <span>KM: {rotation.km_at_rotation.toLocaleString()}</span>
                          {rotation.reason && <span>Reason: {rotation.reason}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start space-x-2">
                <Info size={18} className="text-yellow-500 mt-0.5" />
                <p className="text-xs text-yellow-700">
                  When adding a new tire, the previous tire in this position will be automatically marked as "Worn Out" 
                  and its statistics will be calculated based on the difference in fitted KM.
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4 sticky bottom-0 bg-white pb-2 border-t">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting || loading} 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting || loading ? 'Saving...' : (isEditMode ? 'Update Tire' : 'Add Tire')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};