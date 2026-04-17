import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { ChartData } from '../../../core/model/kpi.model';
import { Observable, Subscription } from 'rxjs';
import * as am5 from "@amcharts/amcharts5";
import * as am5radar from "@amcharts/amcharts5/radar";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { NgClass } from '@angular/common';
import { BaseKpiChartComponent } from '../base-kpi-guage';
import { shortifyString } from '../../../core/utils/app.utils';

@Component({
  selector: 'dash-single-kpi-guage',
  imports: [NgClass],
  templateUrl: './single-kpi-guage.html',
  styleUrl: './single-kpi-guage.scss',
})
export class SingleKpiGuageComponent extends BaseKpiChartComponent implements AfterViewInit, OnDestroy {


    @Input() guageHeight: number = 480;
    @Input() guageWidth: number = 0;
    @Input() chartData$!: Observable<ChartData | null>;
    @Input() chartTitle: string = '';
    @Input() chartDescription: string = '';
    @Input() chartMin: number = 0;
    @Input() chartMax: number = 100;

    @Input() kpiNameLength: number = 42;

    private root?: am5.Root;
    readonly chartId = `gauge-${uuidv4()}`;

    private sub!: Subscription;


    ngOnDestroy(): void {
        this.sub?.unsubscribe();
        if (this.root) {
            this.root.dispose();
            this.root = undefined;
        }
    }

    updateChart(data: ChartData | null): void {
        if (!data) {
            return;
        }
        if (this.root) {
            this.root.dispose();
        }
        this.root = am5.Root.new(this.chartId);
        this.root.setThemes([ am5themes_Animated.new(this.root)]);

        let chart = this.root.container.children.push(
            am5radar.RadarChart.new(this.root, {
                panX: false,
                panY: false,
                startAngle: 180,
                endAngle: 360
            })
        );

        let cursor = chart.set("cursor", am5radar.RadarCursor.new(this.root, {
            behavior: "zoomX"
        }));

        cursor.lineY.set("visible", false);

        let axisRenderer = am5radar.AxisRendererCircular.new(this.root, {
            innerRadius: -20,
            lineCap: "round"
        });

        let xAxis = chart.xAxes.push(
            am5xy.ValueAxis.new(this.root, {
                maxDeviation: 0,
                min: 0,
                max: this.chartMax,
                numberFormat: this.getAxisNumberFormat(data.unitChar),
                strictMinMax: true,
                renderer: axisRenderer
            })
        );

        let axisDataItem = xAxis.makeDataItem({});

        xAxis.createAxisRange(axisDataItem);
        var colorSet = am5.ColorSet.new(this.root, {});
        const fullLabelText = `${data.name} - ${data.value.toString()}${data.unitChar}`;

        let label = chart.radarContainer.children.push(
            am5.Label.new(this.root, {
                centerX: am5.percent(50),
                textAlign: "center",
                centerY: am5.percent(50),
                fontSize: "1.2em",
                fontWeight: "500",
                fill: colorSet.getIndex(0),
                tooltipText: fullLabelText,
                interactive: true,
            })
        );

        axisDataItem.set("value", data.value);
        label.set("html", shortifyString(fullLabelText, this.kpiNameLength));

        chart.bulletsContainer.set("mask", undefined);
        

        let axisRange0 = xAxis.createAxisRange(
            xAxis.makeDataItem({
                above: true,
                value: 0,
                endValue: 0,
            })
        );

        const axisRange0Gradient = am5.LinearGradient.new(this.root, {
            stops: this.getChartStrokeColor(data),
        });
        axisRange0Gradient.set("rotation", 0);

        const axisFill0 = axisRange0.get("axisFill") as am5.Slice | undefined;
        axisFill0?.setAll({
            visible: true,
            fillOpacity: 0.8,
            cornerRadius: 10,
            fillGradient: axisRange0Gradient,
        });
        axisRange0.get("label")?.setAll({ forceHidden: true });

        let axisRange1 = xAxis.createAxisRange(
            xAxis.makeDataItem({
                above: true,
                value: 0,
                endValue: this.chartMax
            })
        );

        const axisFill1 = axisRange1.get("axisFill") as am5.Slice | undefined;
        axisFill1?.setAll({
            visible: true,
            fill: colorSet.getIndex(0),
            fillOpacity: 0.8,
            cornerRadius: 10,
        });
        axisRange1.get("label")?.setAll({ forceHidden: true});

        this.drawChartValue(data.value, axisDataItem, axisRange0, axisRange1);

        chart.appear(2500, 300);
    }


    private drawChartValue(value: number, axisDataItem :am5.DataItem<am5xy.IValueAxisDataItem>, axisRange0:am5.DataItem<am5xy.IValueAxisDataItem>, axisRange1:am5.DataItem<am5xy.IValueAxisDataItem>): void {
        axisDataItem.animate({
            key: "value",
            to: value,
            duration: 1000,
            easing: am5.ease.out(am5.ease.cubic)
        });

        axisRange0.animate({
            key: "endValue",
            to: value,
            duration: 1000,
            easing: am5.ease.out(am5.ease.cubic)
        });

        axisRange1.animate({
            key: "value",
            to: value,
            duration: 1000,
            easing: am5.ease.out(am5.ease.cubic)
        });
    }

    ngAfterViewInit(): void {
        this.sub = this.chartData$.subscribe(data => {
            if(!!data?.maxValue){
                this.chartMax = data.value > data.maxValue ? data.value : data.maxValue;
            }
            this.updateChart(data);
        });
    }

}
