import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { X, Info } from 'lucide-react';
import { Generator, GeneratorFormData, GENERATOR_STATUS_OPTIONS } from '../../types/Generator';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GeneratorFormData) => Promise<void>;
  generator?: Generator | null;
  title: string;
}

const GeneratorModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, generator, title }) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<GeneratorFormData>({
    defaultValues: {
      serial_no: '',
      location: '',
      allocation: '',
      capacity: 0,
      engine_brand: '',
      acquisition_cost: undefined,
      acquisition_date: '',
      current_hour_meter: 0,
      last_service_date: '',
      next_service_date: '',
      status: 'Operational',
    }
  });

  useEffect(() => {
    if (generator) {
      reset({
        serial_no: generator.serial_no,
        location: generator.location || '',
        allocation: generator.allocation,
        capacity: generator.capacity,
        engine_brand: generator.engine_brand || '',
        acquisition_cost: generator.acquisition_cost,
        acquisition_date: generator.acquisition_date ? new Date(generator.acquisition_date).toISOString().slice(0, 10) : '',
        current_hour_meter: generator.current_hour_meter,
        last_service_date: generator.last_service_date ? new Date(generator.last_service_date).toISOString().slice(0, 10) : '',
        next_service_date: generator.next_service_date ? new Date(generator.next_service_date).toISOString().slice(0, 10) : '',
        status: generator.status,
      });
    } else {
      reset({
        serial_no: '',
        location: '',
        allocation: '',
        capacity: 0,
        engine_brand: '',
        acquisition_cost: undefined,
        acquisition_date: '',
        current_hour_meter: 0,
        last_service_date: '',
        next_service_date: '',
        status: 'Operational',
      });
    }
  }, [generator, reset]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = async (formData: GeneratorFormData) => {
    try {
      if (!formData.serial_no) {
        toast.error('Serial number is required');
        return;
      }

      const dataToSubmit = {
        ...formData,
        serial_no: formData.serial_no.toUpperCase(),
        capacity: Number(formData.capacity),
        current_hour_meter: Number(formData.current_hour_meter),
        acquisition_cost: formData.acquisition_cost ? Number(formData.acquisition_cost) : undefined,
      };
      
      await onSubmit(dataToSubmit);
      onClose();
    } catch (error) {
      toast.error('Failed to save generator');
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 overflow-y-auto z-50">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-lg w-full max-w-3xl p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b">
              <h2 className="text-xl font-semibold">{title}</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Information */}
                <div className="md:col-span-2">
                  <h3 className="text-md font-medium text-gray-700 mb-2 pb-1 border-b">Basic Information</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Serial Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('serial_no', { 
                      required: 'Serial number is required',
                      pattern: {
                        value: /^[A-Za-z0-9-]+$/,
                        message: 'Serial number can only contain letters, numbers, and hyphens'
                      }
                    })}
                    placeholder="e.g., GEN-001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 uppercase"
                    style={{ textTransform: 'uppercase' }}
                  />
                  {errors.serial_no && (
                    <p className="text-xs text-red-600 mt-1">{errors.serial_no.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity (kVA) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register('capacity', { 
                      required: 'Capacity is required',
                      min: { value: 0, message: 'Capacity must be positive' },
                      valueAsNumber: true
                    })}
                    placeholder="0.0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.capacity && (
                    <p className="text-xs text-red-600 mt-1">{errors.capacity.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    {...register('location')}
                    placeholder="Generator location"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Allocation <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('allocation', { required: 'Allocation is required' })}
                    placeholder="e.g., Site A, Warehouse"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.allocation && (
                    <p className="text-xs text-red-600 mt-1">{errors.allocation.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Engine Brand
                  </label>
                  <input
                    type="text"
                    {...register('engine_brand')}
                    placeholder="e.g., Caterpillar, Cummins"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('status', { required: 'Status is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {GENERATOR_STATUS_OPTIONS.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                {/* Hour Meter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Hour Meter <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register('current_hour_meter', { 
                      required: 'Hour meter reading is required',
                      min: { value: 0, message: 'Reading must be positive' },
                      valueAsNumber: true
                    })}
                    placeholder="0.0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.current_hour_meter && (
                    <p className="text-xs text-red-600 mt-1">{errors.current_hour_meter.message}</p>
                  )}
                </div>

                {/* Financial Information */}
                <div className="md:col-span-2 mt-2">
                  <h3 className="text-md font-medium text-gray-700 mb-2 pb-1 border-b">Financial Information</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Acquisition Cost
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('acquisition_cost', { valueAsNumber: true })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Acquisition Date
                  </label>
                  <input
                    type="date"
                    {...register('acquisition_date')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Service Dates */}
                <div className="md:col-span-2 mt-2">
                  <h3 className="text-md font-medium text-gray-700 mb-2 pb-1 border-b">Service Information</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Service Date
                  </label>
                  <input
                    type="date"
                    {...register('last_service_date')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Next Service Date
                  </label>
                  <input
                    type="date"
                    {...register('next_service_date')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start space-x-2">
                <Info size={18} className="text-blue-500 mt-0.5" />
                <p className="text-xs text-blue-700">
                  Next service date will be automatically calculated when service records are created.
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
                  disabled={isSubmitting} 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
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

export default GeneratorModal;