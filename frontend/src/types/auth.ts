// src/types/auth.ts
export type UserRole = "ADMIN" | "PFO" | "CS";

export type User = {
  id: string;
  name: string;
  role: UserRole;
  email: string;
};

export type AppRoute = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  children?: AppRoute[];
};
