import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AsyncPipe } from '@angular/common';
import { BehaviorSubject, Observable, catchError, map, tap } from 'rxjs';
import { KpiService } from '../../../core/service/kpi.service';
import { AccordionModule } from 'primeng/accordion';
import { Kpi, User } from '../../../core/model/kpi.model';
import { ButtonModule } from 'primeng/button';
import { UserDashboardComponent } from '../../user-dashboard/user-dashboard';
import { KpiDialogComponent } from '../../dialogs/kpi-dialog/kpi-dialog';
import { UserDialogComponent } from '../../dialogs/user-dialog/user-dialog';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { ContextMenu } from 'primeng/contextmenu';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { RippleModule } from 'primeng/ripple';
import { ConfirmDialogModule } from 'primeng/confirmdialog'; 
import { Router } from '@angular/router';
import { KpiValueTemplComponent } from '../../dialogs/kpi-value-templ/kpi-value-templ';
import { DialogService } from 'primeng/dynamicdialog';
import { KpiDashboardComponent } from '../../kpi-dashboard/kpi-dashboard';

@Component({
    selector: 'app-dashboard',
    imports: [
        TranslateModule,  
        AsyncPipe, 
        RippleModule,
        AccordionModule, 
        ButtonModule, 
        KpiDialogComponent, 
        UserDialogComponent, 
        UserDashboardComponent,  
        TooltipModule, 
        ToastModule,
        ContextMenu,
        ConfirmDialogModule,
        KpiDashboardComponent
    ],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnDestroy, OnInit {

    showNewKPIDialog: boolean = false;
    showNewUserDialog: boolean = false;

    currentUserId: BehaviorSubject<string | undefined> = new BehaviorSubject<string | undefined>(undefined);
    currentUserId$ = this.currentUserId.asObservable();

    currentKpiId: BehaviorSubject<string | undefined> = new BehaviorSubject<string | undefined>(undefined);
    currentKpiId$ = this.currentKpiId.asObservable();

    kpiContextItems: MenuItem[] = [];

    readonly kpis$: Observable<Kpi[]>;
    readonly users$: Observable<User[]>;

    constructor(
        private kpiService: KpiService,
        private translate: TranslateService,
        private confirmService: ConfirmationService,
        private router: Router,
        private messageService: MessageService,
        private dialogService: DialogService
    ) {
        this.kpis$ = this.kpiService.getAll().pipe(
            tap(kpis => {
                if(kpis.length === 0){
                    this.router.navigate(['/welcome']);
                }
            })
        );
        this.users$ = this.kpiService.getAllUsers();
    }

    ngOnInit(): void {
        this.kpiContextItems = [];
    }

    ngOnDestroy(): void {
        this.currentUserId.complete();
        this.currentKpiId.complete();
    }

    setCurrentUser(user:User): void {
        this.currentUserId.next(user.id ? user.id : undefined);
        this.currentKpiId.next(undefined);
    }

    setCurrentKpi(kpi:Kpi): void {
        this.currentKpiId.next(kpi.id ? kpi.id : undefined);
        this.currentUserId.next(undefined);
    }

    getKpiTarget(kpi: Kpi): string {
        return kpi.name;
    }   

    addNewKpi(): void {
        this.showNewKPIDialog = true;
    }

    addNewUser(): void {
        this.showNewUserDialog = true;
    }

    onContextMenu(event: MouseEvent, kpi: Kpi, menu: ContextMenu): void {
        event.preventDefault();
        event.stopPropagation();
        this.kpiContextItems = this.getKpiContextItems(kpi);
        menu.show(event);
    }

    private getKpiContextItems(kpi: Kpi): MenuItem[] {
        return [
            {
                label: this.translate.instant('HOME.DASHBOARD.REMOVE_KPI_LABEL'),
                icon: 'pi pi-trash',
                disabled: false,
                command: () => {
                    this.onKpiRemove(kpi);
                }
            },
            {
                label: this.translate.instant('HOME.DASHBOARD.UPDATE_KPI_TARGET_LABEL'),
                icon: 'pi pi-pencil',
                disabled: false,
                command: () => {
                    this.onKpiUpdateTarget(kpi);
                }
            }
        ];
    }

    private onKpiUpdateTarget(kpi: Kpi): void {
       const dialogRef = this.dialogService.open(KpiValueTemplComponent, {
            data: { kpi: kpi, showUpdateValue: false },
            header: this.translate.instant('HOME.DASHBOARD.KPI_VALUE_DIALOG.HEADING', { KPI_NAME: kpi.name, KPI_TARGET: kpi.target ?? 'N/D' }),
            width: '35rem'
        });
    }


    private onKpiRemove(kpi: Kpi): void {
        this.kpiService.checkIfKpiIsUsed(kpi.id).subscribe(users => {
            if (users.length > 0) {
                this.confirmService.confirm({
                    message: this.translate.instant('HOME.DASHBOARD.CONFIRM_REMOVE_KPI', { KPI_NAME: kpi.name, USER_COUNT: users.length }),
                    header: this.translate.instant('HOME.DASHBOARD.CONFIRM_REMOVE_KPI_HEADER'),
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
                    accept: () => { this.doKpiRemove(kpi, true); }
                });
            } else {
                this.doKpiRemove(kpi, false);
            }
        });
    }

    private doKpiRemove(kpi: Kpi, deep:boolean): void {
        this.kpiService.deleteKpi(kpi.id, deep).pipe(
            catchError(error => {
                this.messageService.add({severity:'error', summary:this.translate.instant('HOME.MESSAGES.KPI_REMOVAL_ERROR', {KPI_NAME: kpi.name}), detail: ''});
                throw error;
            })
        ).subscribe(() => {
            this.messageService.add({ severity: 'success', summary: this.translate.instant('HOME.MESSAGES.KPI_REMOVED', { KPI_NAME: kpi.name }), detail:  ''});
        });
    }

    onNewUserCreated(user: User): void {
        this.setCurrentUser(user);
    }

}
