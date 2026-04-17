import { IGradientStop } from "@amcharts/amcharts5/.internal/core/render/backend/Renderer";
import * as am5 from "@amcharts/amcharts5";
import { ChartData } from "../../core/model/kpi.model";

export abstract class BaseKpiChartComponent {


    readonly successGradientStops: IGradientStop[] = [
        { color: am5.color(0xd1fae5), offset: 1 },
        { color: am5.color(0x6ee7b7), offset: 0.75 },
        { color: am5.color(0x4ade80), offset: 0.5 },
        { color: am5.color(0x16a34a), offset: 0.25 },
        { color: am5.color(0x166534), offset: 0 }
    ];

    readonly warnGradientStops: IGradientStop[] = [
        { color: am5.color(0xfbbf24), offset: 1 },
        { color: am5.color(0xf59e0b), offset: 0.75 },
        { color: am5.color(0xf97316), offset: 0.5 },
        { color: am5.color(0xea580c), offset: 0.25 },
        { color: am5.color(0xdc2626), offset: 0 }
    ];

    readonly dangerGradientStops: IGradientStop[] = [
        { color: am5.color(0xFEE2E2), offset: 1 },
        { color: am5.color(0xFCA5A5), offset: 0.75 },
        { color: am5.color(0xDC2626), offset: 0.5 },
        { color: am5.color(0xB91C1C), offset: 0.25 },
        { color: am5.color(0x7F1D1D), offset: 0 }
    ];

    readonly defaultGradientStops: IGradientStop[] = [
        { color: am5.color(0xe0e7ff), offset: 1 },
        { color: am5.color(0xc7d2fe), offset: 0.75 },
        { color: am5.color(0x090979), offset: 0.5 },
        { color: am5.color(0x070760), offset: 0.25 },
        { color: am5.color(0x04043a), offset: 0 }
    ];

    getChartStrokeColor(data: ChartData): IGradientStop[] {
        const target = data.maxValue;
        const value = data.value;
        if (target !== undefined && target !== null && value !== undefined && value !== null) {
            if(value >= target){
                return this.successGradientStops;
            } else if(value >= target * 0.8){
                return this.warnGradientStops;
            } else {
                return this.dangerGradientStops;
            }
        }
        return this.defaultGradientStops;
    }

    getMaxOffsetVal(value: number): number {
        if (value <= 10) {
            return 5;
        } else if (value <= 50) {
            return 10;
        } else if (value <= 100) {
            return 20;
        } else if (value <= 500) {
            return 50;
        } else if (value <= 1000) {
            return 100;
        } else {
            return Math.ceil(value / 10);
        }
    }

    getAxisNumberFormat(unitChar: string): string {
        return unitChar === '%' ? "#'%'" : `# ${unitChar}`;
    }

    getUnitChar(unit: string): string {
        switch(unit){
            case 'PERCENTAGE':
                return '%';
            case 'CURRENCY':
                return '€';
            case 'ABSOLUTE':
                return 'N';
            default:
                return '';
        }
    }
}