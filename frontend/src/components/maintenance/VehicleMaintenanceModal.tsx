import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { X, Info } from 'lucide-react';
import { VehicleMaintenanceFormData, VehicleMaintenance, MAINTENANCE_TYPES } from '../../types/Maintenance';
import SparePartForm from './SparePartForm';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: VehicleMaintenanceFormData) => Promise<void>;
  record?: VehicleMaintenance | null;
  title: string;
}

const VehicleMaintenanceModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, record, title }) => {
  
  const [spareCost, setSpareCost] = useState(0);

  const { register, handleSubmit, reset, control, watch, formState: { errors, isSubmitting } } = useForm<VehicleMaintenanceFormData>({
    defaultValues: {
      plate_no: '',
      invoice_no: '',
      workshop_name: '',
      maintenance_type: 'Preventive',
      labour_cost: 0,
      costed_by: '',
      spare_part: [],
      km_at_service: 0,
      date_in: '',
      date_out: '',
      remark: '',
    }
  });

  const spareParts = watch('spare_part');

  useEffect(() => {
    if (spareParts) {
      const total = spareParts.reduce((sum, part) => sum + (part.cost || 0), 0);
      setSpareCost(total);
    }
  }, [spareParts]);

  useEffect(() => {
    if (record) {
      reset({
        plate_no: record.plate_no,
        invoice_no: record.invoice_no,
        workshop_name: record.workshop_name || '',
        maintenance_type: record.maintenance_type,
        labour_cost: record.labour_cost,
        costed_by: record.costed_by || '',
        spare_part: record.spare_part || [],
        km_at_service: record.km_at_service,
        date_in: record.date_in ? new Date(record.date_in).toISOString().slice(0, 16) : '',
        date_out: record.date_out ? new Date(record.date_out).toISOString().slice(0, 16) : '',
        remark: record.remark || '',
      });
    } else {
      reset({
        plate_no: '',
        invoice_no: '',
        workshop_name: '',
        maintenance_type: 'Preventive',
        labour_cost: 0,
        costed_by: '',
        spare_part: [],
        km_at_service: 0,
        date_in: '',
        date_out: '',
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
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = async (formData: VehicleMaintenanceFormData) => {
    try {
      const dataToSubmit = {
        ...formData,
        labour_cost: Number(formData.labour_cost),
        km_at_service: Number(formData.km_at_service),
      };
      await onSubmit(dataToSubmit);
      onClose();
    } catch (error) {
      toast.error('Failed to save maintenance record');
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 overflow-y-auto z-50">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-lg w-full max-w-4xl p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b">
              <h2 className="text-xl font-semibold">{title}</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plate Number *</label>
                  <input
                    type="text"
                    {...register('plate_no', { required: 'Plate number is required' })}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 uppercase"
                    placeholder="ABC-123"
                  />
                  {errors.plate_no && <p className="text-xs text-red-600 mt-1">{errors.plate_no.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number *</label>
                  <input
                    type="text"
                    {...register('invoice_no', { required: 'Invoice number is required' })}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 uppercase"
                    placeholder="INV-001"
                  />
                  {errors.invoice_no && <p className="text-xs text-red-600 mt-1">{errors.invoice_no.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Workshop Name</label>
                  <input
                    type="text"
                    {...register('workshop_name')}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Workshop name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Type *</label>
                  <select
                    {...register('maintenance_type', { required: 'Maintenance type is required' })}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {MAINTENANCE_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.maintenance_type && <p className="text-xs text-red-600 mt-1">{errors.maintenance_type.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Labour Cost *</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('labour_cost', { 
                      required: 'Labour cost is required',
                      min: { value: 0, message: 'Cost must be positive' },
                      valueAsNumber: true
                    })}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                  {errors.labour_cost && <p className="text-xs text-red-600 mt-1">{errors.labour_cost.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Costed By</label>
                  <input
                    type="text"
                    {...register('costed_by')}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Person who costed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">KM at Service *</label>
                  <input
                    type="number"
                    step="0.1"
                    {...register('km_at_service', { 
                      required: 'KM at service is required',
                      min: { value: 0, message: 'KM must be positive' },
                      valueAsNumber: true
                    })}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="0.0"
                  />
                  {errors.km_at_service && <p className="text-xs text-red-600 mt-1">{errors.km_at_service.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date In</label>
                  <input
                    type="datetime-local"
                    {...register('date_in')}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Out</label>
                  <input
                    type="datetime-local"
                    {...register('date_out')}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Remark</label>
                  <textarea
                    {...register('remark')}
                    rows={2}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Additional notes..."
                  />
                </div>
              </div>

              {/* Spare Parts Section */}
              <SparePartForm control={control} register={register} errors={errors} />

              {/* Cost Summary */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Cost Summary</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-blue-600">Labour Cost:</span>
                    <span className="ml-2 font-medium">ETB {watch('labour_cost')?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div>
                    <span className="text-blue-600">Spare Parts Cost:</span>
                    <span className="ml-2 font-medium">ETB {spareCost.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-blue-600 font-bold">Total Cost:</span>
                    <span className="ml-2 font-bold">ETB {( (watch('labour_cost') || 0) + spareCost).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start space-x-2">
                <Info size={18} className="text-yellow-500 mt-0.5" />
                <p className="text-xs text-yellow-700">
                  KM difference and cost per KM will be automatically calculated when the next maintenance record is created.
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4 sticky bottom-0 bg-white pb-2 border-t">
                <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
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

export default VehicleMaintenanceModal;