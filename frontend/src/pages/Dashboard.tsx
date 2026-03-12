import React from "react";
import { useAuth } from "../context/AuthContext";
import { TrendingUp, Clock, AlertTriangle, Plus, ChevronRight, MapPin } from "lucide-react";

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const kpis = [
    { label: "Total Fleet", value: "247", icon: <TrendingUp size={20} />, color: "bg-blue-50 text-lib-blue" },
    { label: "Service Due", value: "12", icon: <Clock size={20} />, color: "bg-amber-50 text-lib-gold" },
    { label: "BOLO Alerts", value: "05", icon: <AlertTriangle size={20} />, color: "bg-red-50 text-red-600" },
  ];

  return (
    <div className="p-2 space-y-8 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-(--color-text-main)">
            Overview for <span className="text-lib-blue">{user?.name || "Officer"}</span>
          </h1>
          <p className="text-sm text-(--color-text-muted)">
            Real-time fleet data for Lion International Bank.
          </p>
        </div>
        <button className="btn-primary">
          <Plus size={18} />
          Add Vehicle
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map((kpi, i) => (
          <div key={i} className="card p-6 flex items-center justify-between group hover:border-lib-blue/30 transition-all">
            <div>
              <p className="text-xs font-bold text-(--color-text-muted) uppercase tracking-widest">{kpi.label}</p>
              <p className="text-3xl font-black text-(--color-text-main) mt-1">{kpi.value}</p>
            </div>
            <div className={`p-4 rounded-2xl ${kpi.color} group-hover:scale-110 transition-transform`}>
              {kpi.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Layout: Activity and Quick View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="p-5 border-b border-(--color-border-subtle) bg-slate-50/50 flex justify-between items-center">
            <h2 className="font-bold text-sm uppercase tracking-wider text-slate-700">Recent Movements</h2>
            <button className="text-xs font-bold text-lib-blue hover:underline">View Ledger</button>
          </div>
          <div className="divide-y divide-(--color-border-subtle)">
            {[1, 2, 3, 4].map((_, i) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">🚐</div>
                  <div>
                    <p className="text-sm font-bold text-(--color-text-main)">Plate ABC-123 assigned to Bole</p>
                    <div className="flex items-center gap-2 text-xs text-(--color-text-muted) mt-0.5">
                      <MapPin size={12} />
                      <span>Addis Ababa, Branch 02</span>
                    </div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-300" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar: Quick Summary */}
        <div className="space-y-6">
          <div className="card p-6 bg-lib-blue text-white border-0 shadow-lg shadow-blue-200">
            <h3 className="font-bold">Operational Tip</h3>
            <p className="text-sm text-blue-100 mt-2 leading-relaxed italic">
              "Regular preventative maintenance reduces vehicle downtime by 30%."
            </p>
          </div>
          
          <div className="card p-6">
            <h3 className="font-bold text-sm uppercase text-slate-700 mb-4">Goal Progress</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-500">Service Compliance</span>
                  <span className="text-lib-blue">92%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-lib-blue w-[92%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
