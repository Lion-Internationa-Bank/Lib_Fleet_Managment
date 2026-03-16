import React from 'react';
import { useFieldArray, UseFormRegister, Control, FieldErrors } from 'react-hook-form';
import { Plus, Trash2, Wrench } from 'lucide-react';
import { VehicleMaintenanceFormData, SERVICE_TYPES } from '../../types/Maintenance';

interface Props {
  control: Control<VehicleMaintenanceFormData>;
  register: UseFormRegister<VehicleMaintenanceFormData>;
  errors: FieldErrors<VehicleMaintenanceFormData>;
}

const SparePartForm: React.FC<Props> = ({ control, register, errors }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'spare_part'
  });

  const addSparePart = () => {
    append({
      part: '',
      service_type: 'replace',
      cost: 0,
      service_provider: '',
      inspected_by: '',
      mileage: 0
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-md font-medium text-gray-700 flex items-center">
          <Wrench size={18} className="mr-2" />
          Spare Parts & Services
        </h3>
        <button
          type="button"
          onClick={addSparePart}
          className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
        >
          <Plus size={16} className="mr-1" />
          Add Part
        </button>
      </div>

      {fields.length === 0 && (
        <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500">No spare parts added. Click "Add Part" to add one.</p>
        </div>
      )}

      {fields.map((field, index) => (
        <div key={field.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-gray-700">Part #{index + 1}</h4>
            <button
              type="button"
              onClick={() => remove(index)}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Part Name *
              </label>
              <input
                type="text"
                {...register(`spare_part.${index}.part` as const, { 
                  required: 'Part name is required' 
                })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Brake pads, Oil filter"
              />
              {errors.spare_part?.[index]?.part && (
                <p className="mt-1 text-xs text-red-600">{errors.spare_part[index]?.part?.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Service Type *
              </label>
              <select
                {...register(`spare_part.${index}.service_type` as const, { 
                  required: 'Service type is required' 
                })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {SERVICE_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Cost *
              </label>
              <input
                type="number"
                step="0.01"
                {...register(`spare_part.${index}.cost` as const, { 
                  required: 'Cost is required',
                  min: { value: 0, message: 'Cost must be positive' },
                  valueAsNumber: true
                })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Service Provider *
              </label>
              <input
                type="text"
                {...register(`spare_part.${index}.service_provider` as const, { 
                  required: 'Service provider is required' 
                })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Provider name"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Inspected By *
              </label>
              <input
                type="text"
                {...register(`spare_part.${index}.inspected_by` as const, { 
                  required: 'Inspector name is required' 
                })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Inspector name"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Mileage *
              </label>
              <input
                type="number"
                step="0.1"
                {...register(`spare_part.${index}.mileage` as const, { 
                  required: 'Mileage is required',
                  min: { value: 0, message: 'Mileage must be positive' },
                  valueAsNumber: true
                })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="0.0"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SparePartForm;