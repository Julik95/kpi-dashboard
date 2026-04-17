import { Component, Input, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { ChartData, Kpi, KpiUnit, User } from '../../core/model/kpi.model';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs/internal/Observable';
import { BehaviorSubject, catchError, combineLatest, distinctUntilChanged, filter, map, of, switchMap, tap, throwError } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { TranslateModule } from '@ngx-translate/core';
import { SplitButtonModule } from 'primeng/splitbutton';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { KpiValueTemplComponent } from '../dialogs/kpi-value-templ/kpi-value-templ';
import { KpiService } from '../../core/service/kpi.service';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { AddKpiTemplComponent } from '../dialogs/add-kpi-templ/add-kpi-templ';
import { AsyncPipe, CommonModule } from '@angular/common';
import { SingleKpiGuageComponent } from '../charts/single-kpi-guage/single-kpi-guage';
import { DashboardViewMode } from '../../core/model/app.model';
import { MultiKpiGuageComponent } from '../charts/multi-kpi-guage/multi-kpi-guage';
import { ConfirmDialogModule } from 'primeng/confirmdialog'; 
import { TooltipModule } from 'primeng/tooltip';
import { kpiUnitToString } from '../../core/utils/app.utils';
import { UserUpdateDialog } from '../dialogs/user-update-dialog/user-update-dialog';


@Component({
  selector: 'dash-user-dashboard',
  imports: [
    ButtonModule, 
    TooltipModule,
    MultiKpiGuageComponent,
    TranslateModule, 
    AsyncPipe, 
    SingleKpiGuageComponent, 
    SplitButtonModule, 
    ButtonGroupModule, 
    ConfirmDialogModule,
    CommonModule,
    UserUpdateDialog
],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDashboardComponent implements OnInit {

    DashboardViewMode = DashboardViewMode;

    @Input() userId$: Observable<string | undefined> = of(undefined);
    @Output() userUnset = new EventEmitter<void>();

    hasAvailableKpis$: Observable<boolean> = of(false);
    showNewKpiValueDialog: boolean = false;
    user: User | undefined = undefined;
    allKpisChartData$: Observable<ChartData[]> = of([]);
    currentKpi: BehaviorSubject<ChartData | null> = new BehaviorSubject<ChartData | null>(null);
    currentKpi$ = this.currentKpi.asObservable();
    kpiMenuItems: Record<string, MenuItem[]> = {};
    allKpisSbj: BehaviorSubject<ChartData>[] = [];

    showCompareButton: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    showCompareButton$: Observable<boolean> = this.showCompareButton.asObservable();

    showUserUpdateDialog: boolean = false;

    viewMode: DashboardViewMode = DashboardViewMode.ALL_KPIS;
    readonly kpiLimitForChartView = 4;

    groupedByUnitKpis: Record<string, ChartData[]> = {};


    constructor(
        private translate: TranslateService,
        private dialogService: DialogService,
        private kpiService: KpiService,
        private cdr: ChangeDetectorRef,
        private confirmService: ConfirmationService,
        private messageService: MessageService
    ) { }

    ngOnInit(): void {
        this.hasAvailableKpis$ = this.userId$.pipe(
            distinctUntilChanged(),
            switchMap(userId => {
                this.resetdashboardState();
                if (!userId) {
                    return of(false);
                }
                return combineLatest([
                    this.kpiService.getUser(userId),
                    this.kpiService.getAll()
                ]).pipe(
                    map(([user, allKpis]) => {
                        this.initUserView(user);
                        const userKpiIds = new Set(user?.kpis?.map(k => k.id));
                        return allKpis.some(kpi => !userKpiIds.has(kpi.id));
                    })
                );
            })
        );
    }

    private initUserView(user: User | undefined): void {
        if(!user){ return; }
        this.user = user;
        this.currentKpi.next(null);
        this.showAllKpisView();
        const nextMenuItems: Record<string, MenuItem[]> = {};
        for (const kpi of user?.kpis ?? []) {
            nextMenuItems[kpi.id] = this.getKpiMenuItems(kpi);
            if(!!kpi && !!kpi.value && !!kpi.target && !!kpi.unit){
                this.groupedByUnitKpis[kpi.unit ? kpi.unit : 'undefined'] = [...(this.groupedByUnitKpis[kpi.unit ? kpi.unit : 'undefined'] || []), {
                    name: kpi.name,
                    value: kpi.value ?? 0,
                    maxValue: kpi.target ?? 0,
                    unitChar: kpiUnitToString(kpi.unit)
                } as ChartData];
            }
        }
        this.kpiMenuItems = nextMenuItems;
        this.initAllKpisChartData();
        this.setCompareButtonVisibility();
        this.cdr.detectChanges();
    }

    private initAllKpisChartData(): void {
        if(!!this.user?.id){
            this.allKpisChartData$ = this.kpiService.getUser(this.user.id).pipe(
                map(user => user?.kpis || []),
                map(kpis => kpis.map(kpi => {
                    if(!!kpi && !!kpi.value && !!kpi.target && !!kpi.unit){
                        return {
                            name: kpi.name,
                            value: kpi.value ?? 0,
                            maxValue: kpi.target,
                            unitChar: kpiUnitToString(kpi.unit)
                        } as ChartData;
                    }
                    return null;
                }).filter((data): data is ChartData => data !== null))
            ); 
        }
    }

    private initUserKpisChartData(): void {
        if(!!this.user?.id){
            this.kpiService.getUser(this.user.id).pipe(
                filter((user): user is User => user !== undefined)
            ).subscribe(user => {
                this.user = user;
                const nextMenuItems: Record<string, MenuItem[]> = {};
                for (const kpi of user.kpis ?? []) {
                    nextMenuItems[kpi.id] = this.getKpiMenuItems(kpi);
                }
                this.kpiMenuItems = nextMenuItems;

                const kpisChartData = (user.kpis || []).map(kpi => {
                    if(!!kpi && !!kpi.value && !!kpi.target && !!kpi.unit){
                        return{
                            name: kpi.name,
                            value: kpi.value ?? 0,
                            maxValue: kpi.target,
                            unitChar: kpiUnitToString(kpi.unit)
                        } as ChartData;
                    }
                    return null;
                }).filter((data): data is ChartData => data !== null);

                this.allKpisSbj = kpisChartData.map(kpiData => new BehaviorSubject<ChartData>(kpiData));
                this.cdr.detectChanges();
            });
        }
    }


    onRemoveKpi(kpi: Kpi): void {  
        if (this.user) {
            this.user.kpis = this.user.kpis?.filter(k => k.id !== kpi.id);
            this.kpiService.updateUser(this.user).pipe(
                catchError(error => {
                    this.messageService.add({severity:'error', summary:this.translate.instant('HOME.MESSAGES.KPI_REMOVAL_ERROR', {KPI_NAME: kpi.name }), detail: ''});
                    return throwError(() => error);
                })
            ).subscribe(() => {
                this.messageService.add({severity:'success', summary:this.translate.instant('HOME.MESSAGES.KPI_REMOVED_FROM_USER', {KPI_NAME: kpi.name, USER_NAME: this.userName }), detail: ''});
            });
            if(this.user.kpis?.length === 0){
                this.addNewKpi();
            }
        }
    }

    addNewKpi(): void { 
        const dialogRef = this.dialogService.open(AddKpiTemplComponent, {
            data: { user: this.user },
            header: this.translate.instant('HOME.DASHBOARD.ADD_NEW_KPI_DIALOG.HEADING', { USER_NAME: this.userName }),
            width: '25rem'
        });

        dialogRef?.onClose.subscribe(() => {
            this.cdr.detectChanges();
        });
    }

    kpiDescription(kpi: Kpi | null): string {
        const value = !!(kpi) ? kpi.value : '';
        return `${kpi?.name || ''}`;
    }

    kpiTooltip(kpi: Kpi | null): string {
        const valueLabel = this.translate.instant('HOME.DASHBOARD.KPI_OVERVIEW.VALUE_LABEL');
        const targetLabel = this.translate.instant('HOME.DASHBOARD.KPI_OVERVIEW.TARGET_LABEL');
        const unitLabel = this.translate.instant('HOME.DASHBOARD.KPI_OVERVIEW.UNIT_LABEL');
        const value = !!(kpi) ? `${valueLabel} : ${kpi.value}, `: '';
        const target = !!(kpi) ? `${targetLabel} : ${kpi.target}, ` : '';
        const unit = !!(kpi) ? `${unitLabel} : ${kpiUnitToString(kpi.unit)}` : '';
        return `${value}${target}${unit}`;
    }

    chartDataDescription(chartData: ChartData | null): string {
        const value = !!(chartData) ? chartData.value : '';
        return `${chartData?.name || ''} - ${value}`;
    }

    onKpiUpdate(kpi: Kpi): void {
        const dialogRef = this.dialogService.open(KpiValueTemplComponent, {
            data: { kpi: kpi, user: this.user, showWarning: true },
            header: this.translate.instant('HOME.DASHBOARD.KPI_VALUE_DIALOG.HEADING', { KPI_NAME: kpi.name, KPI_TARGET: kpi.target ?? 'N/D' }),
            width: '35rem'
        });

        dialogRef?.onClose.subscribe((result) => {
            if (result) {
                this.currentKpi.next({
                    name: result.name,
                    value: result.value ?? 0,
                    maxValue: result.target,
                    unitChar: kpiUnitToString(result.unit)
                });
                this.initAllKpisChartData();
            }
            this.cdr.detectChanges();
        });
    }

    showSingleKpiGuage(kpi: Kpi): void {
        if(!kpi.value || !kpi.target || !kpi.unit || kpi.value === 0 || kpi.target === 0){
            this.onKpiUpdate(kpi);
        }else{
            this.currentKpi.next({
                name: kpi.name,
                value: kpi.value ?? 0,
                maxValue: kpi.target ?? 0,
                unitChar: kpiUnitToString(kpi.unit)
            });
            this.viewMode = DashboardViewMode.SINGLE_KPI;
        }
    }

    showAllKpisView(): void {
        this.currentKpi.next(null);
        this.initUserKpisChartData();
        this.viewMode = DashboardViewMode.ALL_KPIS;
    }

    updateUser(): void {
        this.showUserUpdateDialog = true;
    }

    showCompareKpiChart(): void { 
        this.currentKpi.next(null);
        this.viewMode = DashboardViewMode.MULTI_KPI;
    }

    removeUser(): void {
        this.confirmService.confirm({
            message: this.translate.instant('HOME.DASHBOARD.CONFIRM_REMOVE_USER', { USER_NAME: this.userName }),
            header: this.translate.instant('HOME.DASHBOARD.CONFIRM_REMOVE_USER_HEADER'),
            icon: 'pi pi-exclamation-triangle',
            acceptButtonProps: {
                label: this.translate.instant('HOME.DASHBOARD.CONFIRM_ACCEPT_LABEL'),
                severity: 'danger'
            },
            rejectButtonProps: {
                label: this.translate.instant('HOME.DASHBOARD.CONFIRM_REJECT_LABEL'),
                severity: 'secondary',
                outlined: true
            },
            accept: () => {
                if(this.user){
                    this.kpiService.deleteUser(this.user.id).pipe(
                        catchError(error => {
                            this.messageService.add({severity:'error', summary:this.translate.instant('HOME.MESSAGES.USER_REMOVAL_ERROR', {USER_NAME: this.userName}), detail: ''});
                            throw error;
                        })
                    ).subscribe(() => {
                        this.messageService.add({severity:'success', summary:this.translate.instant('HOME.MESSAGES.USER_REMOVED', {USER_NAME: this.userName}), detail: ''});
                        this.currentKpi.next(null);
                        this.userUnset.emit();
                    });
                }
            }
        });
    }

    private getKpiMenuItems(kpi: Kpi): MenuItem[] {
        return [
            {
                label: this.translate.instant('HOME.DASHBOARD.UPDATE_LABEL'),
                icon: 'pi pi-refresh',
                command: () => this.onKpiUpdate(kpi)
            },
            {
                label: this.translate.instant('HOME.DASHBOARD.REMOVE_LABEL'),
                icon: 'pi pi-trash',
                command: () => this.onRemoveKpi(kpi)
            }
        ];
    }

    private setCompareButtonVisibility(): void {
        Object.keys(KpiUnit).forEach(key => {
            if(this.groupedByUnitKpis[key] && this.groupedByUnitKpis[key].length > 1){
                this.showCompareButton.next(true);
            }});
    }

    private resetdashboardState(): void {
        this.user = undefined;
        this.currentKpi.next(null);
        this.kpiMenuItems = {};
        this.allKpisSbj = [];
        this.allKpisChartData$ = of([]);
        this.groupedByUnitKpis = {};
        this.showCompareButton.next(false);
    }

    getChartDataForGroupedKpi(key: string): ChartData[] {
        if(!!this.groupedByUnitKpis[key]){
            return this.groupedByUnitKpis[key].map(kpiData => ({
                name: kpiData.name,
                value: kpiData.value,
                maxValue: kpiData.maxValue,
                unitChar: kpiData.unitChar
            } as ChartData));
        }
        return [];
    }

    get heading(): string {
        return this.translate.instant('HOME.DASHBOARD.HEADING', { USER_NAME: this.userName });
    }

    get userkpis(): Kpi[] {
        return this.user?.kpis || [];
    }

    get userName(): string {
        let userName = this.user?.name || '';
        if(this.user?.sName){
            userName += ' ' + this.user.sName;
        }
        return userName;
    }

    get groupedKpiCount(): number {
        return Object.keys(this.groupedByUnitKpis).length;
    }


    
}
