import { AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { ChartData } from '../../../core/model/kpi.model';
import { Observable, Subscription } from 'rxjs';
import * as am5 from "@amcharts/amcharts5";
import * as am5radar from "@amcharts/amcharts5/radar";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { IGradientStop } from '@amcharts/amcharts5/.internal/core/render/backend/Renderer';
import { NgClass } from '@angular/common';
import { BaseKpiChartComponent } from '../base-kpi-guage';


@Component({
  selector: 'dash-multi-kpi-guage',
  imports: [],
  templateUrl: './multi-kpi-guage.html',
  styleUrl: './multi-kpi-guage.scss',
})
export class MultiKpiGuageComponent extends BaseKpiChartComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {

    @Input() chartData$!: Observable<ChartData[] | null>;
    @Input() chartTitle: string = '';
    @Input() chartDescription: string = '';

    readonly chartId = `gauge-${uuidv4()}`;
    private root?: am5.Root;

    private sub!: Subscription;
    private viewInitialized = false;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['chartData$'] && this.chartData$ && this.viewInitialized) {
            this.sub?.unsubscribe();
            this.sub = this.chartData$.subscribe(data => {
                this.updateChart(data || []);
            });
        }
    }

    ngAfterViewInit(): void {
        this.viewInitialized = true;
        this.sub = this.chartData$.subscribe(data => {
            this.updateChart(data || []);
        });
    }

    ngOnDestroy(): void {
        this.sub?.unsubscribe();
        if (this.root) {
            this.root.dispose();
            this.root = undefined;
        }
    }

    ngOnInit(): void {
        
    }


    updateChart(data: ChartData[]): void {
        if (!data || data.length === 0) {
            return;
        }
        if (this.root) {
            this.root.dispose();
        }
        this.root = am5.Root.new(this.chartId);
        this.root.setThemes([ am5themes_Animated.new(this.root)]);
        const maxValue = data.reduce((max, d) => d.maxValue && d.maxValue > max ? d.maxValue : max, 0);
        const maxTarget = data.reduce((max, d) => d.maxValue && d.maxValue > max ? d.maxValue : max, 0);
        const maxOffset = Math.max(this.getMaxOffsetVal(maxValue), this.getMaxOffsetVal(maxTarget));

        let chart = this.root.container.children.push(
            am5radar.RadarChart.new(this.root, {
                panX: false,
                panY: false,
                wheelX: "panX",
                wheelY: "zoomX",
                innerRadius: am5.percent(20),
                startAngle: -90,
                endAngle: 180
            })
        );
        const am5Data = data.map(d => ({
            category: d.name,
            value: d.value || 0,
            full: d.maxValue || 100,
            target: d.maxValue || 100,
            columnSettings: {
                fillGradient: am5.LinearGradient.new(this.root!, {
                    stops: this.getChartStrokeColor(d),
                    rotation: 0
                })
            }
        })) ;

        let cursor = chart.set("cursor", am5radar.RadarCursor.new(this.root, {
            behavior: "zoomX"
        }));

        cursor.lineY.set("visible", false);

        let xRenderer = am5radar.AxisRendererCircular.new(this.root, {});

        xRenderer.labels.template.setAll({
            radius: 30
        });

        xRenderer.labels.template.adapters.add("text", (text) => {
            if (!text) {
                return text;
            }
            return text.includes("%") ? text : `${text}%`;
        });

        xRenderer.grid.template.setAll({
        forceHidden: true
        });

        let xAxis = chart.xAxes.push(am5xy.ValueAxis.new(this.root, {
            renderer: xRenderer,
            min: 0,
            max: maxValue + maxOffset,
            strictMinMax: true,
            numberFormat: this.getAxisNumberFormat(data[0].unitChar),
            tooltip: am5.Tooltip.new(this.root, {})
        }));

        let yRenderer = am5radar.AxisRendererRadial.new(this.root, {
            minGridDistance: 20
        });

        yRenderer.labels.template.setAll({
            centerX: am5.p100,
            fontWeight: "500",
            fontSize: 18,
            templateField: "columnSettings",
            paddingRight: 20
        });

        yRenderer.grid.template.setAll({ forceHidden: true});

        let yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(this.root, {
            categoryField: "category",
            renderer: yRenderer
        }));

        yAxis.data.setAll(am5Data);

        let series1 = chart.series.push(am5radar.RadarColumnSeries.new(this.root, {
            xAxis: xAxis,
            yAxis: yAxis,
            clustered: false,
            valueXField: "full",
            categoryYField: "category",
            fill: this.root.interfaceColors.get("alternativeBackground")
        }));

        series1.columns.template.setAll({
            width: am5.p100,
            fillOpacity: 0.08,
            strokeOpacity: 0,
            cornerRadius: 20
        });

        series1.data.setAll(am5Data);

        let series2 = chart.series.push(am5radar.RadarColumnSeries.new(this.root, {
            xAxis: xAxis,
            yAxis: yAxis,
            clustered: false,
            valueXField: "value",
            categoryYField: "category"
        }));

        series2.columns.template.setAll({
            width: am5.p100,
            strokeOpacity: 0,
            tooltipText: "{category}: {valueX} - con target: {target}",
            cornerRadius: 30,
            templateField: "columnSettings",
        });

        series2.data.setAll(am5Data);

        const targetTickSeries = chart.series.push(am5radar.RadarColumnSeries.new(this.root, {
            xAxis: xAxis,
            yAxis: yAxis,
            clustered: false,
            valueXField: "target",
            categoryYField: "category"
        }));

        targetTickSeries.columns.template.setAll({
            forceHidden: true,
            fillOpacity: 0,
            strokeOpacity: 0
        });

        targetTickSeries.data.setAll(am5Data);
        
        // Add visual ticks every 5 units along the x-axis
        for (let i = 0; i <= maxValue; i += 5) {
            const tickRange = xAxis.createAxisRange(
                xAxis.makeDataItem({
                    value: i,
                })
            );
            
            tickRange.get("tick")?.setAll({
                visible: true,
                stroke: am5.color(0x000000),
                strokeWidth: 2,
                length: 15,
                inside: false
            });
            
            tickRange.get("grid")?.setAll({
                visible: false
            });
        }

        // Add red ticks for each KPI target value
        data.forEach((d) => {
            const targetValue = d.maxValue ?? 100;
            const targetTickRange = xAxis.createAxisRange(
                xAxis.makeDataItem({
                    value: targetValue,
                })
            );

            const targetTick = targetTickRange.get("tick");
            targetTick?.setAll({
                visible: true,
                stroke: am5.color(0x166534),
                strokeWidth: 3,
                length: 30,
                inside: false,
                interactive: true,
                showTooltipOn: "hover",
                tooltipText: `${d.name}: target ${targetValue}`
            });

            targetTickRange.get("grid")?.setAll({
                visible: false
            });
        });
        
        series1.appear(1000);
        series2.appear(1000);
        targetTickSeries.appear(1000);
        chart.appear(1000, 100);
    }

}

