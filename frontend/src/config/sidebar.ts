// src/config/sidebar.ts
import React from 'react';
import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Car, Wrench, AlertCircle, FileText, Fuel, XCircle,UserCircleIcon, Gauge} from "lucide-react";
import { AppRoute, UserRole } from "../types/auth";

const createIcon = (icon: LucideIcon): React.ReactNode => React.createElement(icon, { size: 18 });

export const adminSidebar: AppRoute[] = [
  { id: "dashboard", label: "Dashboard", icon: createIcon(LayoutDashboard), path: "/dashboard" },
  {
    id: "vehicles",
    label: "Vehicles",
    icon: createIcon(Car),
    path: "/dashboard/vehicles",
  },
  {
    id: "foreclosure",
    label: "Foreclosure Vehicles",
    icon: createIcon(XCircle),
    path: "/dashboard/foreclosure",
  },
  {
   id: "generator",
   label:"Generators",
   icon: createIcon(UserCircleIcon),
   path:'/dashboard/generators'

  },
  {
    id: "maintenance",
    label: "Maintenance",
    icon: createIcon(Wrench),
    children: [
      { id: "maint-vehicle", label: "Vehicle Service Records", path: "/dashboard/maintenance/vehicles" },
      { id: "maint-generator", label: "Generator Service Records", path: "/dashboard/maintenance/generators" },
      { id: "maint-tire", label: "Tire Records", path: "/dashboard/maintenance/tires" },
      { id: "maint-agreements", label: "Maintenance Agreements", path: "/dashboard/maintenance/agreements" },
    ],
  },
  {
    id: "compliance",
    label: "Active Reminders",
    icon: createIcon(AlertCircle),
    path: "/dashboard/compliance/reminders",
  },
  { id: "accidents", label: "Accidents", icon: createIcon(XCircle), path: "/dashboard/accidents" },
  { id: "fuel", label: "Fuel Records", icon: createIcon(Fuel), path: "/dashboard/fuel" },
   {
    id: "insurances",
    label: "Insurances",
    icon: createIcon(Gauge),
    path: "/dashboard/insurances",
  },
  {
    id: "reports",
    label: "Reports",
    icon: createIcon(FileText),
    path: "/dashboard/reports",
  },
];

// COMPLETE PFO Sidebar
export const pfoSidebar: AppRoute[] = [
  { id: "dashboard", label: "Dashboard", icon: createIcon(LayoutDashboard), path: "/dashboard/dashboard" },
  {
    id: "vehicles",
    label: "Vehicles",
    icon: createIcon(Car),
    path: "/dashboard/vehicles",
  },
  {
    id: "foreclosure",
    label: "Foreclosure Vehicles",
    icon: createIcon(XCircle),
    path: "/dashboard/foreclosure",
  },
  {
    id: "maintenance",
    label: "Maintenance",
    icon: createIcon(Wrench),
    children: [
      { id: "maint-vehicle", label: "Vehicle Maintenance", path: "/dashboard/maintenance/vehicles" },
      { id: "maint-generator", label: "Generator Maintenance", path: "/dashboard/maintenance/generators" },
      { id: "maint-tire", label: "Tire Records", path: "/dashboard/maintenance/tires" },
      { id: "maint-agreements", label: "Maintenance Agreements", path: "/dashboard/maintenance/agreements" },
    ],
  },
  {
    id: "compliance",
    label: "Active Reminders",
    icon: createIcon(AlertCircle),
    path: "/dashboard/compliance/reminders",
  },
  {
    id: "reports",
    label: "Reports",
    icon: createIcon(FileText),
    path: "/dashboard/reports",
  },
];

// COMPLETE CS Sidebar
export const csSidebar: AppRoute[] = [
  { id: "dashboard", label: "Dashboard", icon: createIcon(LayoutDashboard), path: "/dashboard" },
  {
    id: "vehicles",
    label: "Vehicles",
    icon: createIcon(Car),
    path: "/dashboard/vehicles",
  },
  {
    id: "compliance",
    label: "Active Reminders",
    icon: createIcon(AlertCircle),
    path: "/dashboard/compliance/reminders",
  },
  { id: "accidents", label: "Accidents", icon: createIcon(XCircle), path: "/dashboard/accidents" },
  { id: "fuel", label: "Fuel Records", icon: createIcon(Fuel), path: "/dashboard/fuel" },
];

export const getSidebarByRole = (role: UserRole): AppRoute[] => {
  return { ADMIN: adminSidebar, PFO: pfoSidebar, CS: csSidebar }[role] || [];
};
