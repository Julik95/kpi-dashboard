export interface Kpi {
  id: string;
  name: string;
  value?: number;
  target?: number;
  unit?: KpiUnit;
}

export enum KpiUnit {
  PERCENTAGE = '%',
  CURRENCY = '€',
  ABSOLUTE = 'N'
}

export interface User{
  id: string;
  name: string;
  sName?: string;
  kpis?: Kpi[];
}

export interface ChartData {
  name: string; 
  value: number;
  maxValue: number;
  unitChar: string;
}
