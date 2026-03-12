import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { User, LogOut, Bell, Search } from "lucide-react";

export const TopBar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) return null;

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-slate-100 bg-white px-6">
      {/* 1. Left Section: Search or Breadcrumbs */}
      <div className="flex items-center flex-1 max-w-md">
        <div className="relative w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-lib-blue transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search fleet, plate #, or driver..." 
            className="w-full bg-slate-50 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-lib-blue/10 transition-all"
          />
        </div>
      </div>

      {/* 2. Right Section: Actions & Profile */}
      <div className="flex items-center gap-2">
        
        {/* Simple Notification Icon */}
        <button className="relative p-2.5 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors">
          <Bell size={20} />
          <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-lib-gold ring-2 ring-white" />
        </button>

        {/* Vertical Divider */}
        <div className="w-px h-6 bg-slate-100 mx-2" />

        {/* User Profile Block - Cleaned up */}
        <div className="flex items-center gap-3 pl-2 group cursor-default">
          <div className="flex flex-col items-end">
            <span className="text-sm font-bold text-slate-900 leading-tight">
              {user.name}
            </span>
            <span className="text-[10px] font-bold text-lib-blue uppercase tracking-wider opacity-80">
              {user.role}
            </span>
          </div>
          
          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100 group-hover:border-lib-blue/30 transition-all">
            <User size={20} className="text-slate-600" />
          </div>
        </div>

        {/* Logout - Now using a "Ghost" style to avoid cluttering the primary view */}
        <button
          onClick={handleLogout}
          className="ml-3 p-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all group"
          title="Logout"
        >
          <LogOut size={20} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </header>
  );
};
