import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useAuth } from "../../contex/AuthContext";
import { getSidebarByRole } from "../../config/sidebar";

export const AppLayout: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  const routes = getSidebarByRole(user.role);

  return (
    // 1. Changed bg-slate-950 to bg-white
    // 2. Changed text-slate-100 to text-slate-900 (Deep Navy)
    <div className="flex h-screen overflow-hidden bg-white text-slate-900">
      
      {/* Sidebar handles its own internal light styling */}
      <Sidebar routes={routes} />

      {/* 3. Ensure the content area takes the remaining width and has a vertical flow */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        
        <TopBar />

        {/* 
          4. Main Content Area 
          - Changed bg-slate-950/95 to bg-slate-50 (Light gray background)
          - This provides contrast against the white cards and sidebar
        */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
