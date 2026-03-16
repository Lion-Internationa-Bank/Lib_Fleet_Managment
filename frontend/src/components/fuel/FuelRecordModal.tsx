import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { X, Info } from 'lucide-react';
import { FuelRecordFormData, FuelRecord, FUEL_USAGE_TYPES } from '../../types/FuelRecord';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FuelRecordFormData) => Promise<void>;
  record?: FuelRecord | null;
  title: string;
}

const FuelModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  record, 
  title 
}) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting }, watch } = useForm<FuelRecordFormData>({
    defaultValues: {
      plate_no: '',
      starting_date: '',
      starting_km: 0,
      fuel_in_birr: 0,
      birr_per_liter: 0,
      fuel_usage_type: '',
      remark: '',
    }
  });

  const fuelInBirr = watch('fuel_in_birr');
  const birrPerLiter = watch('birr_per_liter');
  const [calculatedLiters, setCalculatedLiters] = useState<number | null>(null);

  useEffect(() => {
    if (fuelInBirr && birrPerLiter && birrPerLiter > 0) {
      setCalculatedLiters(Number((fuelInBirr / birrPerLiter).toFixed(3)));
    } else {
      setCalculatedLiters(null);
    }
  }, [fuelInBirr, birrPerLiter]);

  useEffect(() => {
    if (record) {
      reset({
        plate_no: record.plate_no,
        starting_date: record.starting_date ? new Date(record.starting_date).toISOString().slice(0, 16) : '',
        starting_km: record.starting_km,
        fuel_in_birr: record.fuel_in_birr,
        birr_per_liter: record.birr_per_liter,
        fuel_usage_type: record.fuel_usage_type,
        remark: record.remark || '',
      });
    } else {
      reset({
        plate_no: '',
        starting_date: '',
        starting_km: 0,
        fuel_in_birr: 0,
        birr_per_liter: 0,
        fuel_usage_type: '',
        remark: '',
      });
    }
  }, [record, reset]);

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

  const handleFormSubmit = async (data: FuelRecordFormData) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      toast.error('Failed to save fuel record');
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity z-40"
        onClick={onClose}
      />
      
      <div className="fixed inset-0 overflow-y-auto z-50">
        <div className="flex min-h-full items-center justify-center p-4">
          <div 
            className="relative bg-white rounded-lg w-full max-w-2xl p-6 shadow-xl"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Plate Number - Text Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Plate Number *
                  </label>
                  <input
                    type="text"
                    {...register('plate_no', { 
                      required: 'Plate number is required',
                      pattern: {
                        value: /^[A-Za-z0-9-]+$/,
                        message: 'Plate number can only contain letters, numbers, and hyphens'
                      }
                    })}
                    placeholder="e.g., ABC-123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                    style={{ textTransform: 'uppercase' }}
                  />
                  {errors.plate_no && (
                    <p className="mt-1 text-sm text-red-600">{errors.plate_no.message}</p>
                  )}
                </div>

                {/* Starting Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Starting Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    {...register('starting_date', { required: 'Starting date is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.starting_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.starting_date.message}</p>
                  )}
                </div>

                {/* Starting KM */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Starting Kilometer *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('starting_km', { 
                      required: 'Starting KM is required',
                      min: { value: 0, message: 'KM must be positive' },
                      valueAsNumber: true
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.starting_km && (
                    <p className="mt-1 text-sm text-red-600">{errors.starting_km.message}</p>
                  )}
                </div>

                {/* Fuel in Birr */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fuel Amount (Birr) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('fuel_in_birr', { 
                      required: 'Fuel amount is required',
                      min: { value: 0, message: 'Amount must be positive' },
                      valueAsNumber:true,
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.fuel_in_birr && (
                    <p className="mt-1 text-sm text-red-600">{errors.fuel_in_birr.message}</p>
                  )}
                </div>

                {/* Birr per Liter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price per Liter (Birr) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('birr_per_liter', { 
                      required: 'Price per liter is required',
                      min: { value: 0, message: 'Price must be positive' },
                      valueAsNumber:true,
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.birr_per_liter && (
                    <p className="mt-1 text-sm text-red-600">{errors.birr_per_liter.message}</p>
                  )}
                </div>

                {/* Calculated Liters (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Liters Used (Calculated)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={calculatedLiters !== null ? calculatedLiters.toFixed(3) : ''}
                      readOnly
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600"
                      placeholder="Auto-calculated"
                    />
                    {calculatedLiters !== null && (
                      <div className="absolute right-2 top-2 text-xs text-gray-500">
                        ≈ {calculatedLiters.toFixed(3)} L
                      </div>
                    )}
                  </div>
                </div>

                {/* Fuel Usage Type - Dropdown */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fuel Usage Type *
                  </label>
                  <select
                    {...register('fuel_usage_type', { required: 'Fuel usage type is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select usage type</option>
                    {FUEL_USAGE_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.fuel_usage_type && (
                    <p className="mt-1 text-sm text-red-600">{errors.fuel_usage_type.message}</p>
                  )}
                </div>

                {/* Remark */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remark (Optional)
                  </label>
                  <textarea
                    {...register('remark')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Any additional notes..."
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start space-x-2">
                <Info size={18} className="text-blue-500 mt-0.5" />
                <p className="text-xs text-blue-700">
                  The ending data (ending date, ending KM, KM difference, and KM per liter) will be automatically calculated when the next fuel record for this vehicle is created.
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
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

export default FuelModal;