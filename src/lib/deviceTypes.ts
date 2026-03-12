import { DeviceTypeConfig } from './types';

// Device types array synced with backend
export let deviceTypes: DeviceTypeConfig[] = [];

// CRUD operations for device types calling backend
export const addDeviceType = async (type: Omit<DeviceTypeConfig, 'id'>) => {
  const res = await fetch('/api/device-types', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(type)
  });
  return await res.json();
};

export const updateDeviceType = async (id: string, updates: Partial<DeviceTypeConfig>) => {
  const res = await fetch(`/api/device-types/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  return await res.json();
};

export const deleteDeviceType = async (id: string) => {
  const res = await fetch(`/api/device-types/${id}`, {
    method: 'DELETE'
  });
  return (await res.json()).success;
};

