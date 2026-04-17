import { Component, Input, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import { KpiService } from '../../core/service/kpi.service';
import { ChartData, Kpi, User } from '../../core/model/kpi.model';
import { TranslateModule } from '@ngx-translate/core';
import { TagModule } from 'primeng/tag';
import { ChipModule } from 'primeng/chip';
import { KpiHistoComponent } from '../charts/kpi-histo/kpi-histo';

@Component({
    selector: 'dash-kpi-dashboard',
    imports: [AsyncPipe, TranslateModule, TagModule, ChipModule, KpiHistoComponent],
    templateUrl: './kpi-dashboard.html',
    styleUrl: './kpi-dashboard.scss',
})
export class KpiDashboardComponent implements OnInit {

    @Input() kpiId$!: Observable<string | undefined>;

    currentKpi$: Observable<Kpi | undefined> = of(undefined);
    usersOfKpi$: Observable<User[]> = of([]);

    histoChartData: BehaviorSubject<ChartData[] | null> = new BehaviorSubject<ChartData[] | null>(null);
    histoChartData$: Observable<ChartData[] | null> = this.histoChartData.asObservable();


    constructor(private kpiService: KpiService) {

     }

    ngOnInit(): void {
        this.kpiId$.subscribe(kpiId => {
            if(!!kpiId){
                this.currentKpi$ = this.kpiService.get(kpiId);
                this.usersOfKpi$ = this.kpiService.getUsersByKpiId(kpiId).pipe(
                    tap(users => {
                        const chartData = users.map(user => {
                            const userKpi = user.kpis?.find(k => k.id === kpiId && !!k.value && !!k.target);
                            return {
                                name: this.getUserName(user),
                                value: userKpi?.value ?? 0,
                                maxValue: userKpi?.target ?? 0,
                                unitChar: userKpi?.unit ?? ''
                            } as ChartData;
                        });
                        this.histoChartData.next(chartData);
                    })
                );
            }
        });
    }


    getUserName(user: User): string {
        return user.sName ? `${user.name} ${user.sName}` : user.name;
    }

}
