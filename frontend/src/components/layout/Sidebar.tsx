import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import { AppRoute } from "../../types/auth";

export const Sidebar: React.FC<{ routes: AppRoute[] }> = ({ routes }) => {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (id: string) => {
    setOpenMenus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderNavItem = (item: AppRoute, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openMenus[item.id];
    const paddingLeft = depth * 12; // Indent children

    if (hasChildren) {
      return (
        <div key={item.id} className="space-y-1">
          <button
            onClick={() => toggleMenu(item.id)}
            className={`w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all text-(--color-text-muted) hover:bg-slate-50 hover:text-lib-blue`}
            style={{ paddingLeft: `${16 + paddingLeft}px` }}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg opacity-80">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </div>
            {isOpen ? (
              <ChevronDown size={16} className="opacity-50" />
            ) : (
              <ChevronRight size={16} className="opacity-50" />
            )}
          </button>
          
          {isOpen && item.children && (
            <div className="space-y-1">
              {item.children.map(child => renderNavItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <NavLink
        key={item.id}
        to={item.path ?? "#"}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
            isActive 
              ? "bg-lib-blue text-white shadow-md shadow-blue-100" 
              : "text-(--color-text-muted) hover:bg-slate-50 hover:text-lib-blue"
          }`
        }
        style={{ paddingLeft: `${16 + paddingLeft}px` }}
      >
        <span className="text-lg opacity-80">{item.icon}</span>
        <span className="truncate">{item.label}</span>
      </NavLink>
    );
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-(--color-border-subtle) bg-(--color-surface)">
      <div className="flex h-16 items-center border-b border-(--color-border-subtle) px-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-lib-blue rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">LIB</span>
          </div>
          <span className="text-lib-blue text-xl font-bold tracking-tight">Fleet</span>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto px-3 py-6">
        <div className="space-y-1">
          {routes.map((item) => renderNavItem(item, 0))}
        </div>
      </nav>

      <div className="p-4 border-t border-(--color-border-subtle) bg-slate-50/50">
        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">System Status</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-medium text-slate-600">Secure • 2025</span>
        </div>
      </div>
    </aside>
  );
};