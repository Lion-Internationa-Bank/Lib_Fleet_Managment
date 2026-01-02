// src/config/sidebar.ts
import React from 'react';
import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Car, Wrench, AlertCircle, FileText, Fuel, XCircle } from "lucide-react";
import { AppRoute, UserRole } from "../types/auth";

const createIcon = (icon: LucideIcon): React.ReactNode => React.createElement(icon, { size: 18 });

export const adminSidebar: AppRoute[] = [
  { id: "dashboard", label: "Dashboard", icon: createIcon(LayoutDashboard), path: "/dashboard" },
  {
    id: "vehicles",
    label: "Vehicles",
    icon: createIcon(Car),
    path: "/vehicles",
  },
  {
    id: "foreclosure",
    label: "Foreclosure Vehicles",
    icon: createIcon(XCircle),
    path: "/foreclosure",
  },
  {
    id: "maintenance",
    label: "Maintenance",
    icon: createIcon(Wrench),
    children: [
      { id: "maint-vehicle", label: "Vehicle Service Records", path: "/maintenance/vehicles" },
      { id: "maint-generator", label: "Generator Service Records", path: "/maintenance/generators" },
      { id: "maint-tire", label: "Tire Records", path: "/maintenance/tires" },
      { id: "maint-agreements", label: "Maintenance Agreements", path: "/maintenance/agreements" },
    ],
  },
  {
    id: "compliance",
    label: "Active Reminders",
    icon: createIcon(AlertCircle),
    path: "/compliance/reminders",
  },
  { id: "accidents", label: "Accidents", icon: createIcon(XCircle), path: "/accidents" },
  { id: "fuel", label: "Fuel Records", icon: createIcon(Fuel), path: "/fuel" },
  {
    id: "reports",
    label: "Reports",
    icon: createIcon(FileText),
    path: "/reports",
  },
];

// COMPLETE PFO Sidebar
export const pfoSidebar: AppRoute[] = [
  { id: "dashboard", label: "Dashboard", icon: createIcon(LayoutDashboard), path: "/dashboard" },
  {
    id: "vehicles",
    label: "Vehicles",
    icon: createIcon(Car),
    path: "/vehicles",
  },
  {
    id: "foreclosure",
    label: "Foreclosure Vehicles",
    icon: createIcon(XCircle),
    path: "/foreclosure",
  },
  {
    id: "maintenance",
    label: "Maintenance",
    icon: createIcon(Wrench),
    children: [
      { id: "maint-vehicle", label: "Vehicle Maintenance", path: "/maintenance/vehicles" },
      { id: "maint-generator", label: "Generator Maintenance", path: "/maintenance/generators" },
      { id: "maint-tire", label: "Tire Records", path: "/maintenance/tires" },
      { id: "maint-agreements", label: "Maintenance Agreements", path: "/maintenance/agreements" },
    ],
  },
  {
    id: "compliance",
    label: "Active Reminders",
    icon: createIcon(AlertCircle),
    path: "/compliance/reminders",
  },
  {
    id: "reports",
    label: "Reports",
    icon: createIcon(FileText),
    path: "/reports",
  },
];

// COMPLETE CS Sidebar
export const csSidebar: AppRoute[] = [
  { id: "dashboard", label: "Dashboard", icon: createIcon(LayoutDashboard), path: "/dashboard" },
  {
    id: "vehicles",
    label: "Vehicles",
    icon: createIcon(Car),
    path: "/vehicles",
  },
  {
    id: "compliance",
    label: "Active Reminders",
    icon: createIcon(AlertCircle),
    path: "/compliance/reminders",
  },
  { id: "accidents", label: "Accidents", icon: createIcon(XCircle), path: "/accidents" },
  { id: "fuel", label: "Fuel Records", icon: createIcon(Fuel), path: "/fuel" },
];

export const getSidebarByRole = (role: UserRole): AppRoute[] => {
  return { ADMIN: adminSidebar, PFO: pfoSidebar, CS: csSidebar }[role] || [];
};
