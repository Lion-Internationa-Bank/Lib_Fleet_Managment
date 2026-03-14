import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { UserRole } from "../../types/auth";
import { useNavigate } from "react-router-dom";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("zedoyetefe@gmail.com");
  const [role, setRole] = useState<UserRole>("ADMIN");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, role);
    navigate("/dashboard");
  };

  return (
    // Updated: Simple dark mode background
    <div className="flex min-h-screen items-center justify-center bg-white text-slate-900">
      {/* Updated: Using the 'card' utility class from index.css */}
      <div className="w-full max-w-md card p-8">
        <div className="mb-8 text-center">
          {/* Updated: Using the text-brand utility (gold) */}
          <h1 className="text-brand text-3xl font-bold">
            LIB Fleet Management
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Sign in and choose your role to continue.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Email
            </label>
            {/* Updated: Using the 'input' utility class from index.css */}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="your.email@lib.com"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Role
            </label>
            {/* Updated: Using the 'select' utility class from index.css */}
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="select"
            >
              <option value="ADMIN">Admin (Full Access)</option>
              <option value="PFO">Property & Facility Officer</option>
              <option value="CS">Customer Service</option>
            </select>
          </div>

          {/* Updated: Using the 'btn-primary' utility class from index.css (Lib Blue) */}
          <button type="submit" className="w-full btn-primary py-3">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};
