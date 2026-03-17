import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Login } from "./pages/auth/Login";
import { AppLayout } from "./components/layout/AppLayout";
import { Dashboard } from "./pages/Dashboard";
import { Vehicles } from "./pages/Vehicles";

import VehicleServiceRecords from "./pages/maintenance/VehicleServiceRecords";
import ForeclosureVehicles from "./pages/ForeclosureVehicles";
import GeneratorServiceRecords from "./pages/maintenance/GeneratorServiceRecords";

import TireRecords from "./pages/maintenance/TireRecords";
import MaintenanceAgreements from "./pages/maintenance/MaintenanceAgreements";
import ActiveReminders from "./pages/compliance/ActiveReminders";
import Accidents from "./pages/Accidents";
import FuelRecords from "./pages/FuelRecords";
import Reports from "./pages/Reports";
import Generators from "./pages/Generators";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/" replace />;
};

const AppContent: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="" element={<Dashboard />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="foreclosure" element={<ForeclosureVehicles />} />
          
          {/* Maintenance Routes */}
          <Route path="maintenance/vehicles" element={<VehicleServiceRecords />} />
          <Route path="maintenance/generators" element={<GeneratorServiceRecords />} />
          <Route path="maintenance/tires" element={<TireRecords />} />
          <Route path="maintenance/agreements" element={<MaintenanceAgreements />} />
          
          {/* Compliance Routes */}
          <Route path="compliance/reminders" element={<ActiveReminders />} />
          
          {/* Accidents and Fuel Routes */}
          <Route path="accidents" element={<Accidents />} />
          <Route path="fuel" element={<FuelRecords />} />
          
          {/* Reports Route */}
          <Route path="reports" element={<Reports />} />
          <Route path="generators" element={<Generators/>} />
          
          {/* Catch all for unknown routes under dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster 
        position="top-right"
        richColors
        closeButton
        expand={true}
        duration={4000}
        theme="light"
        toastOptions={{
          className: 'my-toast',
          style: {
            background: 'white',
            color: '#1f2937',
            border: '1px solid #e5e7eb',
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;