import { TaskStatus } from '../../core/models/api.models';

export interface StatusConfig {
  label: string;
  color: string;
  icon?: string;
}

export const TASK_STATUS_CONFIG: Record<TaskStatus, StatusConfig> = {
  draft: { label: 'Draft', color: '#9e9e9e', icon: 'edit' },
  pending_approval: { label: 'Pending Approval', color: '#ff9800', icon: 'hourglass_empty' },
  approved: { label: 'Approved', color: '#9c27b0', icon: 'check_circle_outline' },
  queued: { label: 'Queued', color: '#607d8b', icon: 'schedule' },
  running: { label: 'Running', color: '#2196f3', icon: 'sync' },
  success: { label: 'Success', color: '#4caf50', icon: 'check_circle' },
  failed: { label: 'Failed', color: '#f44336', icon: 'error' },
};
