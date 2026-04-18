export interface Device {
  id: string;
  name: string;
  ip_address: string;
  vendor: string;
  napalm_driver: string;
  username?: string;
  password?: string;
  created_at?: string;
}

export interface DeviceConfig {
  id: string;
  device: string; // Device ID
  content: string;
  version: number;
  created_at?: string;
}

export type TaskStatus = 'draft' | 'pending_approval' | 'approved' | 'queued' | 'running' | 'success' | 'failed';

export interface Task {
  id: string;
  device: string; // Device ID
  device_name?: string;
  config: string; // Config ID
  status: TaskStatus;
  logs: string;
  progress: number;
  created_at: string;
  updated_at: string;
}
