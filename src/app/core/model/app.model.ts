export interface KeyValuePair {
  key: string;
  value: any;
}

export interface Log {
  id?: number;
  message: string;
  timestamp: Date;
}

export enum LogLevel {
  INFO = 'info',
  ERROR = 'error',
  WARNING = 'warning'
}

export enum DashboardViewMode {
  SINGLE_KPI = 'single_kpi',
  MULTI_KPI = 'multi_kpi',
  ALL_KPIS = 'all_kpis'
}