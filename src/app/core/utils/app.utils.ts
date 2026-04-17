import { inject, InjectionToken } from '@angular/core';
import { LogLevel } from '../model/app.model';
import { Router } from '@angular/router';
import { KpiUnit } from '../model/kpi.model';

export const LOG_LEVEL = new InjectionToken<LogLevel>('LOG_LEVEL');

export function kpiUnitToString(unit: KpiUnit | undefined): string {
    switch(unit){
        case 'PERCENTAGE' as KpiUnit:
            return '%';
        case 'CURRENCY' as KpiUnit:
            return '€';
        case 'ABSOLUTE' as KpiUnit:
            return 'N';
        default:
            return '';
    }
}

export function shortifyString(str: string, maxLength: number): string {
    if (str.length <= maxLength) {
        return str;
    }
    return str.slice(0, maxLength - 3) + '...';
}
