import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BaseKpiChartComponent } from '../base-kpi-guage';
import { ChartData } from '../../../core/model/kpi.model';
import { Observable, of, Subscription } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import * as am5 from "@amcharts/amcharts5";
import { IGradientStop } from "@amcharts/amcharts5/.internal/core/render/backend/Renderer";
import * as am5radar from "@amcharts/amcharts5/radar";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

@Component({
    selector: 'dash-kpi-histo',
    imports: [],
    templateUrl: './kpi-histo.html',
    styleUrl: './kpi-histo.scss',
})
export class KpiHistoComponent extends BaseKpiChartComponent implements OnInit, OnDestroy, AfterViewInit {


    @Input() chartData$: Observable<ChartData[] | null> = of(null);

    private root?: am5.Root;
    readonly chartId = `gauge-${uuidv4()}`;

    private sub!: Subscription;

    ngOnInit(): void {
        
    }

    updateChart(data: ChartData[] | null): void {
        if (!data || data.length === 0) {
            return;
        }
        const enrichedData = data.map(item => ({
            ...item,
            gradientStops: this.getChartStrokeColor(item)
        }));
        if (this.root) { this.root.dispose(); }
        this.root = am5.Root.new(this.chartId);
        this.root.setThemes([ am5themes_Animated.new(this.root)]);

        let chart = this.root.container.children.push(am5xy.XYChart.new(this.root, {
            panX: false,
            panY: false,
            wheelX: "panX",
            wheelY: "zoomX",
            paddingLeft:0,
            layout: this.root.verticalLayout
        }));

        let legend = chart.children.push(am5.Legend.new(this.root, {
            centerX: am5.p50,
            x: am5.p50
        }));

        let yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(this.root, {
            categoryField: "name",
            renderer: am5xy.AxisRendererY.new(this.root, {
                inversed: true,
                cellStartLocation: 0.1,
                cellEndLocation: 0.9,
                minorGridEnabled: true
            })
        }));

        yAxis.data.setAll(enrichedData);

        let xAxis = chart.xAxes.push(am5xy.ValueAxis.new(this.root, {
            renderer: am5xy.AxisRendererX.new(this.root, {
            strokeOpacity: 0.1,
                minGridDistance: 50
            }),
            min: 0
        }));

        this.createSeries(chart, yAxis, xAxis, enrichedData, "maxValue", "Target");
        this.createSeries(chart, yAxis, xAxis, enrichedData, "value", "Valore attuale");

        legend.data.setAll(chart.series.values);

        let cursor = chart.set("cursor", am5xy.XYCursor.new(this.root, {
            behavior: "zoomY"
        }));

        cursor.lineY.set("forceHidden", true);
        cursor.lineX.set("forceHidden", true);

        chart.appear(1000, 100);

    }

    private createSeries(chart: am5xy.XYChart, yAxis: am5xy.CategoryAxis<am5xy.AxisRenderer>, xAxis: am5xy.ValueAxis<am5xy.AxisRenderer>, data:ChartData[], field: string, label: string): am5xy.ColumnSeries {
        const unitChar = data.length > 0 ? data[0].unitChar : '';
        let series = chart.series.push(am5xy.ColumnSeries.new(this.root!, {
            name: label,
            xAxis: xAxis,
            yAxis: yAxis,
            valueXField: field,
            categoryYField: "name",
            sequencedInterpolation: true,
            tooltip: am5.Tooltip.new(this.root!, {
                pointerOrientation: "horizontal",
                labelText: `[bold]${label} - {name}[/]\n{valueX} ${this.getUnitChar(unitChar)}`
            })
        }));

        series.columns.template.setAll({
            height: am5.p100,
            strokeOpacity: 0,
        });


        series.bullets.push(() => {
            return am5.Bullet.new(this.root!, {
                locationX: 1,
                locationY: 0.5,
                sprite: am5.Label.new(this.root!, {
                    centerY: am5.p50,
                    text: `{valueX} ${this.getUnitChar(unitChar)}`,
                    populateText: true
                })
            });
        });

        series.bullets.push(() => {
            return am5.Bullet.new(this.root!, {
                locationX: 1,
                locationY: 0.5,
                sprite: am5.Label.new(this.root!, {
                    centerX: am5.p100,
                    centerY: am5.p50,
                    text: "{name}",
                    fill: am5.color(0xffffff),
                    populateText: true
                })
            });
        });

        series.data.setAll(data);
        series.appear();

        return series;
    }

    ngOnDestroy(): void {
        this.sub?.unsubscribe();
        if (this.root) {
            this.root.dispose();
            this.root = undefined;
        }
    }


    ngAfterViewInit(): void {
        this.sub = this.chartData$.subscribe(data => {
            this.updateChart(data);
        });
    }

}
