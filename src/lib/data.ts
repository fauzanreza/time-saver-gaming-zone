import { Device, Session, SavedTime, Alert, RevenueReport } from './types';
import { deviceTypes } from './deviceTypes';
export { deviceTypes };

// Device and session arrays are synced with backend
export let devices: Device[] = [];
export let activeSessions: Session[] = [];

// Mock data for session history
export const sessionHistory: Session[] = [
  {
    id: 'hist-001',
    deviceId: 'pc-001',
    startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    endTime: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
    duration: 120,
    remainingTime: 0,
    amountCharged: 10
  },
  {
    id: 'hist-002',
    deviceId: 'pc-002',
    startTime: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
    duration: 120,
    remainingTime: 0,
    amountCharged: 10
  },
  {
    id: 'hist-003',
    deviceId: 'phone-001',
    startTime: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 25.5 * 60 * 60 * 1000).toISOString(),
    duration: 30,
    remainingTime: 0,
    amountCharged: 1
  }
];

// Saved time
export let savedTimes: SavedTime[] = [];

// Mock data for alerts
export const alerts: Alert[] = [
  {
    id: 'alert-001',
    deviceId: 'pc-003',
    deviceName: 'Gaming PC 3',
    type: 'session-ending',
    message: 'Session ending in 5 minutes',
    createdAt: new Date().toISOString(),
    read: false
  },
  {
    id: 'alert-002',
    deviceId: 'pc-005',
    deviceName: 'Standard PC 2',
    type: 'system',
    message: 'Device is offline - needs attention',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago
    read: false
  }
];

// Mock data for revenue reports
export const revenueReports: RevenueReport[] = [
  {
    date: new Date(Date.now() - 0 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // Today
    totalRevenue: 78,
    deviceRevenue: {
      'gaming-pc': 45,
      'pc': 15,
      'phone': 10,
      'console': 8
    },
    sessionCount: 22
  },
  {
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // Yesterday
    totalRevenue: 65,
    deviceRevenue: {
      'gaming-pc': 35,
      'pc': 18,
      'phone': 8,
      'console': 4
    },
    sessionCount: 18
  },
  {
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // 2 days ago
    totalRevenue: 92,
    deviceRevenue: {
      'gaming-pc': 50,
      'pc': 20,
      'phone': 12,
      'console': 10
    },
    sessionCount: 25
  }
];

// Helper functions to work with mock data
export const getDeviceById = (id: string): Device | undefined => {
  return devices.find(device => device.id === id);
};

export const getActiveSession = (deviceId: string): Session | undefined => {
  return activeSessions.find(session => session.deviceId === deviceId);
};

// Function to format time from minutes to hours, minutes and seconds
export const formatTime = (minutes: number): string => {
  if (minutes === 0) return "0 dtk";
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.floor(minutes % 60);
  const seconds = Math.floor((minutes % 1) * 60);
  
  const parts = [];
  if (hours > 0) parts.push(`${hours} jam`);
  if (remainingMinutes > 0) parts.push(`${remainingMinutes} mnt`);
  if (seconds > 0) parts.push(`${seconds} dtk`);
  
  return parts.join(' ');
};

// Function to format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatIDRInput = (value: number | string): string => {
  if (!value) return '';
  const number = parseInt(String(value).replace(/[^0-9]/g, ''), 10);
  if (isNaN(number)) return '';
  return new Intl.NumberFormat('id-ID').format(number);
};

export const parseIDRInput = (value: string): number => {
  const number = parseInt(value.replace(/[^0-9]/g, ''), 10);
  return isNaN(number) ? 0 : number;
};

// New functions for session management
export const startSession = (deviceId: string, duration: number, customerName?: string): Session => {
  const device = getDeviceById(deviceId);
  
  if (!device) {
    throw new Error(`Device with ID ${deviceId} not found`);
  }
  
  // Update device status
  const deviceIndex = devices.findIndex(d => d.id === deviceId);
  if (deviceIndex !== -1) {
    devices[deviceIndex].status = 'in-use';
  }
  
  // Calculate amount to charge based on duration and hourly rate
  const amountCharged = (device.hourlyRate * duration) / 60;
  
  // Create new session
  const newSession: Session = {
    id: `session-${Date.now()}`,
    deviceId,
    customerName,
    startTime: new Date().toISOString(),
    duration,
    remainingTime: duration,
    amountCharged
  };
  
  // Call backend without awaiting to maintain sync signature
  fetch('/api/start-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceId, duration, customerName })
  }).catch(console.error);
  
  return newSession;
};


export const stopSession = (deviceId: string, saveRemainingTime: boolean): SavedTime | undefined => {
  const sessionIndex = activeSessions.findIndex(session => session.deviceId === deviceId);
  
  if (sessionIndex === -1) {
    return undefined;
  }
  
  const session = activeSessions[sessionIndex];
  
  // Update device status
  const deviceIndex = devices.findIndex(d => d.id === deviceId);
  if (deviceIndex !== -1) {
    devices[deviceIndex].status = 'available';
  }
  
  // Remove from active sessions
  const removedSession = activeSessions.splice(sessionIndex, 1)[0];
  
  // Add to session history with end time
  sessionHistory.push({
    ...removedSession,
    endTime: new Date().toISOString(),
    remainingTime: 0
  });
  
  // If saving time, create a saved time entry
  if (saveRemainingTime && removedSession.remainingTime > 0) {
    const savedTime: SavedTime = {
      id: `saved-${Date.now()}`,
      customerIdentifier: `Customer (Session ID: ${removedSession.id})`,
      minutes: removedSession.remainingTime,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // expires in 7 days
      isActive: true
    };
    savedTimes.push(savedTime);
    
    // Hit backend async without waiting
    fetch('/api/stop-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, saveRemainingTime })
    }).catch(console.error);
    
    return savedTime;
  }
  
  // Hit backend async without waiting
  fetch('/api/stop-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceId, saveRemainingTime })
  }).catch(console.error);

  return undefined;
};

export const resumeSavedTime = (savedTimeId: string, deviceId: string): Session | undefined => {
  const savedTimeIndex = savedTimes.findIndex(st => st.id === savedTimeId);
  
  if (savedTimeIndex === -1) {
    return undefined;
  }
  
  const savedTime = savedTimes[savedTimeIndex];
  
  if (!savedTime.isActive) {
    return undefined;
  }
  
  const device = getDeviceById(deviceId);
  
  if (!device || device.status !== 'available') {
    return undefined;
  }
  
  // Update device status
  const deviceIndex = devices.findIndex(d => d.id === deviceId);
  if (deviceIndex !== -1) {
    devices[deviceIndex].status = 'in-use';
  }
  
  // Calculate amount based on device hourly rate
  const amountCharged = (device.hourlyRate * savedTime.minutes) / 60;
  
  // Create new session
  const newSession: Session = {
    id: `session-${Date.now()}`,
    deviceId,
    startTime: new Date().toISOString(),
    duration: savedTime.minutes,
    remainingTime: savedTime.minutes,
    amountCharged,
    notes: `Resumed from saved time (ID: ${savedTime.id})`
  };
  
  // Add to active sessions
  activeSessions.push(newSession);
  
  // Mark saved time as used
  savedTimes[savedTimeIndex].isActive = false;
  
  return newSession;
};

// Function to update remaining time for sessions
let lastFetch = 0;

export const fetchData = async () => {
  try {
    const res = await fetch('/api/state');
    const data = await res.json();
    if (data && data.devices) {
      devices.splice(0, devices.length, ...data.devices);
      activeSessions.splice(0, activeSessions.length, ...data.activeSessions);
      savedTimes.splice(0, savedTimes.length, ...data.savedTimes);
      if (data.deviceTypes) {
        deviceTypes.splice(0, deviceTypes.length, ...data.deviceTypes);
      }
      return true;
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
  return false;
};

// Initial immediate fetch
fetchData();

export const updateSessionTimes = () => {
  const now = Date.now();
  
  // Quick background sync loop - increased frequency for better responsiveness
  if (now - lastFetch > 2000) {
    lastFetch = now;
    fetchData();
  }
  
  activeSessions.forEach((session, index) => {
    const sessionStartTime = new Date(session.startTime).getTime();
    const elapsedTime = (now - sessionStartTime) / (60 * 1000); // Convert to minutes with decimals for seconds
    const newRemainingTime = Math.max(0, session.duration - elapsedTime);
    
    activeSessions[index].remainingTime = newRemainingTime;
    
    // Update device status if session is ending soon (< 5 minutes remaining)
    if (newRemainingTime <= 5 && newRemainingTime > 0) {
      const deviceIndex = devices.findIndex(d => d.id === session.deviceId);
      if (deviceIndex !== -1 && devices[deviceIndex].status !== 'ending-soon') {
        devices[deviceIndex].status = 'ending-soon';
      }
    }
  });
};

// Function to simulate time passing for demo purposes
export const simulateTimePassing = (minutes: number) => {
  activeSessions.forEach((session, index) => {
    const newRemainingTime = Math.max(0, session.remainingTime - minutes);
    activeSessions[index].remainingTime = newRemainingTime;
    
    // Update device status based on remaining time
    const deviceIndex = devices.findIndex(d => d.id === session.deviceId);
    if (deviceIndex !== -1) {
      if (newRemainingTime <= 0) {
        devices[deviceIndex].status = 'available';
        // In a real app, would move to session history here
      } else if (newRemainingTime <= 5) {
        devices[deviceIndex].status = 'ending-soon';
      }
    }
  });
};
