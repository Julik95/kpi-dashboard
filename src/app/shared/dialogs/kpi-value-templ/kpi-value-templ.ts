import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputNumberModule } from 'primeng/inputnumber';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Kpi, User } from '../../../core/model/kpi.model';
import { SelectModule } from 'primeng/select';
import { KpiService } from '../../../core/service/kpi.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-kpi-value-templ',
  imports: [FormsModule, ReactiveFormsModule, ButtonModule, TranslateModule, FloatLabelModule, InputNumberModule, SelectModule, InputTextModule],
  templateUrl: './kpi-value-templ.html',
  styleUrl: './kpi-value-templ.scss',
})
export class KpiValueTemplComponent implements OnInit {

    showUpdateValue: boolean = true;
    showWarning: boolean = false;

    newKpiValueFG: FormGroup;
    currentUser: User | undefined = undefined;
    kpi: Kpi | null = null;

    readonly kpiUnitOptions;

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,
        private translate: TranslateService,
        private kpiService: KpiService,
        private confrimService: ConfirmationService,
        private messageService: MessageService
    ) {
        this.showUpdateValue = this.config.data?.showUpdateValue ?? true;
        this.showWarning = this.config.data?.showWarning ?? false;
        this.kpi = this.config.data?.kpi || null;
        this.currentUser = this.config.data?.user || undefined;
        this.newKpiValueFG = new FormGroup({
            kpiTarget: new FormControl('', Validators.required),
            kpiUnit: new FormControl('', Validators.required),
            kpiName: new FormControl('', Validators.required)
        });
        
        if(this.showUpdateValue){
            this.newKpiValueFG.addControl('kpiValue', new FormControl('', Validators.required));
        }
        this.kpiUnitOptions = [
            { label: this.translate.instant('HOME.DASHBOARD.ADD_NEW_KPI_DIALOG.KPI_UNIT_PERCENTAGE'), value: 'PERCENTAGE' },
            { label: this.translate.instant('HOME.DASHBOARD.ADD_NEW_KPI_DIALOG.KPI_UNIT_CURRENCY'), value: 'CURRENCY' },
            { label: this.translate.instant('HOME.DASHBOARD.ADD_NEW_KPI_DIALOG.KPI_UNIT_ABSOLUTE'), value: 'ABSOLUTE' }
        ];
    }

    ngOnInit(): void {  
        if(!!this.kpi){
            if(this.showUpdateValue){
                this.newKpiValueFG.get('kpiValue')?.setValue(this.kpi.value);
            }
            this.newKpiValueFG.get('kpiTarget')?.setValue(this.kpi.target);
            this.newKpiValueFG.get('kpiUnit')?.setValue(this.kpi.unit);
            this.newKpiValueFG.get('kpiName')?.setValue(this.kpi.name);
        }
    }

    get showRemoveButton(): boolean {
        return !!this.kpi && !!this.currentUser && this.currentUser.kpis?.some(k => k.id === this.kpi?.id) || false;
    }

    onKpiRemove(): void {
        if(this.currentUser && this.kpi){
            this.currentUser.kpis = this.currentUser.kpis?.filter(k => k.id !== this.kpi?.id);
            this.kpiService.updateUser(this.currentUser).subscribe();
        }
        this.ref.close();
    }


    onSubmit(): void {
        if (this.newKpiValueFG.valid) {
            const kpiTarget = this.newKpiValueFG.get('kpiTarget')?.value;
            const kpiUnit = this.newKpiValueFG.get('kpiUnit')?.value;
            const kpiName = this.newKpiValueFG.get('kpiName')?.value.trim();
            if(!!this.kpi){
                this.kpi.target = kpiTarget;
                this.kpi.unit = kpiUnit;
                this.kpi.name = kpiName;
                if(this.showUpdateValue){
                    this.kpi.value = this.newKpiValueFG.get('kpiValue')?.value;
                }
                if(!!this.currentUser && !!this.currentUser.kpis && !!this.kpi){
                    this.currentUser.kpis.forEach(k => {
                        if(k.id === this.kpi?.id){
                            k.target = kpiTarget;
                            k.unit = kpiUnit;
                            k.name = kpiName;
                            if(this.showUpdateValue){
                                k.value = this.newKpiValueFG.get('kpiValue')?.value;
                            }
                        }
                    });
                    this.kpiService.updateUser(this.currentUser).subscribe();
                }else{
                    if(this.newKpiValueFG.dirty){
                        this.kpiService.updateKpi(this.kpi).subscribe(() =>{
                            this.messageService.add({severity:'success', summary:this.translate.instant('HOME.MESSAGES.KPI_UPDATED', { KPI_NAME: this.kpi?.name }), detail: ''});
                        });
                        this.kpiService.getUsersByKpi(this.kpi).subscribe(users => {
                            this.confrimService.confirm({
                                message: this.translate.instant('HOME.DASHBOARD.KPI_VALUE_DIALOG.UPDATE_KPI_USERS_MESSAGE', { KPI_NAME: this.kpi?.name, USER_COUNT: users.length }),
                                header: this.translate.instant('HOME.DASHBOARD.KPI_VALUE_DIALOG.UPDATE_KPI_USERS_HEADER'),
                                icon: 'pi pi-exclamation-triangle',
                                acceptButtonProps: {
                                    label: this.translate.instant('HOME.DASHBOARD.KPI_VALUE_DIALOG.UPDATE_KPI_USERS_CONFIRM'),
                                    severity: 'warning'
                                },
                                rejectButtonProps: {
                                    label: this.translate.instant('HOME.DASHBOARD.KPI_VALUE_DIALOG.UPDATE_KPI_USERS_CANCEL'),
                                    severity: 'secondary',
                                    outlined: true
                                },
                                accept: () => {
                                    const updateUsers = users.map(user => {
                                        const updatedKpis = user.kpis?.map(k => {
                                            if(k.id === this.kpi?.id){
                                                return { ...k, target: kpiTarget, unit: kpiUnit, value: this.showUpdateValue ? this.newKpiValueFG.get('kpiValue')?.value : k.value, name: kpiName }
                                            }
                                            return k;
                                        });
                                        return { ...user, kpis: updatedKpis };
                                    });
                                    this.kpiService.updateUser(updateUsers).subscribe(() => {
                                        this.messageService.add({severity:'success', summary:this.translate.instant('HOME.MESSAGES.KPI_FOR_USERS_UPDATED', { KPI_NAME: this.kpi?.name }), detail: ''});
                                        this.onDialogClose();
                                    });
                                }
                            });
                        });
                    }
                }
            }
            this.onDialogClose();
        }
    }   

    onDialogClose(): void {
        this.newKpiValueFG.reset();
        this.ref.close(this.kpi);
    }

    get userName(): string {
        let userName = this.currentUser?.name ?? '';
        if(!!this.currentUser?.sName){
            userName += ` ${this.currentUser.sName}`;
        }
        return userName;
    }
    
}
