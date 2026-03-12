// import React, { useState } from "react";
// import { X } from "lucide-react";
// import { vehicleService } from "../services/vehicle.service";
// import { VehicleListItem } from "../types/api.types";
// import { toast } from "sonner";

// interface VehicleFormModalProps {
//   vehicle?: VehicleListItem | null;
//   onClose: () => void;
//   onSuccess: () => void;
// }

// export const VehicleFormModal: React.FC<VehicleFormModalProps> = ({ 
//   vehicle, 
//   onClose, 
//   onSuccess 
// }) => {
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     plate_no: vehicle?.plate_no || '',
//     location: vehicle?.location || '',
//     vehicle_allocation: vehicle?.vehicle_allocation || '',
//     vehicle_type: vehicle?.vehicle_type || '',
//     vehicle_model: vehicle?.vehicle_model || '',
//     fuel_type: vehicle?.fuel_type || 'Petrol',
//     current_km: vehicle?.current_km || 0,
//     next_service_date: vehicle?.next_service_date || '',
//     bolo_expired_date: vehicle?.bolo_expired_date || '',
//   });

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       if (vehicle) {
//         await vehicleService.update(vehicle.plate_no, formData);
//         toast.success('Vehicle updated successfully');
//       } else {
//         await vehicleService.create(formData);
//         toast.success('Vehicle created successfully');
//       }
//       onSuccess();
//     } catch (error) {
//       // Error handled by interceptor
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4">
//         <div className="flex items-center justify-between mb-6">
//           <h2 className="text-2xl font-bold text-(--color-text-main)">
//             {vehicle ? 'Edit Vehicle' : 'New Vehicle'}
//           </h2>
//           <button 
//             onClick={onClose}
//             className="p-2 hover:bg-(--color-bg-subtle) rounded-lg transition-colors"
//           >
//             <X size={20} />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-(--color-text-main) mb-2">
//                 Plate Number *
//               </label>
//               <input
//                 type="text"
//                 required
//                 className="input-field"
//                 value={formData.plate_no}
//                 onChange={(e) => setFormData({ ...formData, plate_no: e.target.value.toUpperCase() })}
//                 disabled={!!vehicle}
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-(--color-text-main) mb-2">
//                 Location *
//               </label>
//               <input
//                 type="text"
//                 required
//                 className="input-field"
//                 value={formData.location}
//                 onChange={(e) => setFormData({ ...formData, location: e.target.value })}
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-(--color-text-main) mb-2">
//                 Allocation *
//               </label>
//               <select
//                 required
//                 className="input-field"
//                 value={formData.vehicle_allocation}
//                 onChange={(e) => setFormData({ ...formData, vehicle_allocation: e.target.value })}
//               >
//                 <option value="">Select Allocation</option>
//                 <option value="Executive">Executive</option>
//                 <option value="Operations">Operations</option>
//                 <option value="Fleet">Fleet</option>
//                 <option value="Rental">Rental</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-(--color-text-main) mb-2">
//                 Vehicle Type *
//               </label>
//               <select
//                 required
//                 className="input-field"
//                 value={formData.vehicle_type}
//                 onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
//               >
//                 <option value="">Select Type</option>
//                 <option value="Sedan">Sedan</option>
//                 <option value="SUV">SUV</option>
//                 <option value="Truck">Truck</option>
//                 <option value="Van">Van</option>
//                 <option value="Bus">Bus</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-(--color-text-main) mb-2">
//                 Vehicle Model *
//               </label>
//               <input
//                 type="text"
//                 required
//                 className="input-field"
//                 value={formData.vehicle_model}
//                 onChange={(e) => setFormData({ ...formData, vehicle_model: e.target.value })}
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-(--color-text-main) mb-2">
//                 Fuel Type *
//               </label>
//               <select
//                 required
//                 className="input-field"
//                 value={formData.fuel_type}
//                 onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
//               >
//                 <option value="Petrol">Petrol</option>
//                 <option value="Diesel">Diesel</option>
//                 <option value="Regular">Regular</option>
//                 <option value="Octane">Octane</option>
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-(--color-text-main) mb-2">
//                 Current KM *
//               </label>
//               <input
//                 type="number"
//                 required
//                 className="input-field"
//                 value={formData.current_km}
//                 onChange={(e) => setFormData({ ...formData, current_km: parseInt(e.target.value) })}
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-(--color-text-main) mb-2">
//                 Next Service Date *
//               </label>
//               <input
//                 type="date"
//                 required
//                 className="input-field"
//                 value={formData.next_service_date.split('T')[0]}
//                 onChange={(e) => setFormData({ ...formData, next_service_date: e.target.value })}
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-(--color-text-main) mb-2">
//                 BOLO Expiry Date *
//               </label>
//               <input
//                 type="date"
//                 required
//                 className="input-field"
//                 value={formData.bolo_expired_date.split('T')[0]}
//                 onChange={(e) => setFormData({ ...formData, bolo_expired_date: e.target.value })}
//               />
//             </div>
//           </div>

//           <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-(--color-border-subtle)">
//             <button 
//               type="button"
//               onClick={onClose}
//               className="btn-secondary px-6 py-2.5"
//               disabled={loading}
//             >
//               Cancel
//             </button>
//             <button 
//               type="submit"
//               className="btn-primary px-6 py-2.5"
//               disabled={loading}
//             >
//               {loading ? 'Saving...' : vehicle ? 'Update Vehicle' : 'Create Vehicle'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };