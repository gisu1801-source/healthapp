export enum TaskStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  startTime: string; // ISO String
  endTime: string; // ISO String
  isDeepWork: boolean;
  category: string;
  status: TaskStatus;
}

export interface NLPResponse {
  title: string;
  startTime?: string;
  endTime?: string;
  isDeepWork: boolean;
  category: string;
  description?: string;
}

export interface NotificationState {
  show: boolean;
  message: string;
  subtext?: string;
  type: 'success' | 'alert' | 'info';
}
