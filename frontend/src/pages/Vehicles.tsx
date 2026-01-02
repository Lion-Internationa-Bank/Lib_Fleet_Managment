import React from "react";
import { Car, Clock } from "lucide-react";

export const Vehicles: React.FC = () => {
  // Placeholder data for the table (replace with your actual data source)
  const vehicleData = [
    { plate: "ABC 123Z", model: "Toyota Hilux", location: "Addis Ababa", status: "Operational", serviceDate: "Dec 28, 2025", badgeType: 'success' },
    { plate: "ET 998B", model: "Isuzu FSR", location: "Bahir Dar", status: "In Service", serviceDate: "Jan 05, 2026", badgeType: 'warning' },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          {/* Updated: Standard text main color for titles */}
          <h1 className="text-3xl font-bold text-(--color-text-main)">Vehicle Management</h1>
          <p className="text-(--color-text-muted) mt-1">Complete vehicle lifecycle management</p>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Updated: Using 'card' utility for light theme, blue hover accent */}
        <div className="card p-6 border-lib-blue/10 hover:shadow-lg transition-all group">
          <div className="flex items-center">
            {/* Updated: Icon wrapper using brand blue soft background */}
            <div className="p-3 bg-lib-blue/10 rounded-xl group-hover:scale-110 transition-transform">
              <Car className="text-lib-blue" size={20} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-(--color-text-muted)">Total Vehicles</p>
              <p className="text-3xl font-bold text-(--color-text-main)">247</p>
            </div>
          </div>
        </div>
        
        {/* Example KPI 2: Service Due */}
        <div className="card p-6 border-lib-gold/10 hover:shadow-lg transition-all group">
          <div className="flex items-center">
            <div className="p-3 bg-lib-gold/10 rounded-xl group-hover:scale-110 transition-transform">
              <Clock className="text-lib-gold" size={20} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-(--color-text-muted)">Due Service</p>
              <p className="text-3xl font-bold text-(--color-text-main)">12</p>
            </div>
          </div>
        </div>
        
        {/* Additional KPI cards would follow the same pattern */}
      </div>

      {/* Table Section */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-(--color-text-main)">Vehicle List</h2>
          {/* Updated: Using btn-primary utility (LIB Blue) */}
          <button className="btn-primary px-6 py-2.5">
            + New Vehicle
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {/* Updated: Using table-header utility */}
              <tr className="border-b border-(--color-border-subtle) table-header">
                <th className="py-4">Plate #</th>
                <th className="py-4">Model</th>
                <th className="py-4">Location</th>
                <th className="py-4">Status</th>
                <th className="py-4">Next Service</th>
                <th className="text-right py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--color-border-subtle)">
              {vehicleData.map((vehicle, index) => (
                // Updated: Using table-row utility
                <tr key={index} className="table-row">
                  <td className="py-4 font-mono font-semibold text-(--color-text-main)">{vehicle.plate}</td>
                  <td className="py-4 text-(--color-text-main)">{vehicle.model}</td>
                  <td className="py-4 text-(--color-text-muted)">{vehicle.location}</td>
                  <td className="py-4">
                    {/* Updated: Using badge utilities */}
                    <span className={vehicle.badgeType === 'success' ? 'badge-success' : 'badge-warning'}>
                      {vehicle.status}
                    </span>
                  </td>
                  <td className="py-4 text-(--color-text-muted)">{vehicle.serviceDate}</td>
                  <td className="py-4 text-right space-x-3">
                    {/* Updated: Action links using brand colors */}
                    <button className="text-lib-blue font-semibold hover:text-blue-700 transition-colors">
                      View
                    </button>
                    <button className="text-lib-gold font-semibold hover:text-amber-700 transition-colors">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
