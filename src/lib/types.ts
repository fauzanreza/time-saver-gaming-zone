// Types for the internet cafe management system

// Device Types
export interface DeviceTypeConfig {
  id: string;
  name: string;
  value: string;
  hourlyRate: number;
  isSystem?: boolean;
}

export type DeviceType = string;

export type DeviceStatus = 'available' | 'in-use' | 'ending-soon' | 'offline';

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  status: DeviceStatus;
  hourlyRate: number;
  specs?: string;
  image?: string; // Keeping for backward compatibility
  images?: string[]; // New property for multiple images
}

// Session Types
export interface Session {
  id: string;
  deviceId: string;
  customerName?: string;
  startTime: string;
  endTime?: string;
  duration: number; // in minutes
  remainingTime: number; // in minutes
  timeExtended?: boolean;
  amountCharged?: number;
  notes?: string;
}


// Saved Time for Customers
export interface SavedTime {
  id: string;
  customerIdentifier: string;
  minutes: number;
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
}

// Admin User
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  name: string;
}

// Revenue Report
export interface RevenueReport {
  date: string;
  totalRevenue: number;
  deviceRevenue: Record<string, number>; // device type to revenue
  sessionCount: number;
}

// Alert
export interface Alert {
  id: string;
  deviceId: string;
  deviceName: string;
  type: 'session-ending' | 'payment-required' | 'system';
  message: string;
  createdAt: string;
  read: boolean;
}

export interface DurationSuggestion {
  id: string;
  label: string;
  minutes: number;
}
