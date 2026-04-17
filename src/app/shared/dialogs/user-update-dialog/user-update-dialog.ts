import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Kpi, User } from '../../../core/model/kpi.model';
import { KpiService } from '../../../core/service/kpi.service';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TableModule } from 'primeng/table';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { kpiUnitToString } from '../../../core/utils/app.utils';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
    selector: 'dash-user-update-dialog',
    imports: [
        DialogModule, 
        TranslateModule, 
        FormsModule, 
        ReactiveFormsModule, 
        InputTextModule, 
        FloatLabelModule, 
        TableModule,
        TagModule,
        ButtonModule,
        InputNumberModule,
        AsyncPipe
    ],
    templateUrl: './user-update-dialog.html',
    styleUrl: './user-update-dialog.scss',
})
export class UserUpdateDialog implements OnInit {


    @Input() userId$: Observable<string | undefined> = of(undefined);
    @Input() showDialog: boolean = false;
    @Output() showDialogChange = new EventEmitter<boolean>()

    kpis$: Observable<Kpi[]> = of([]);

    currentUser:User | undefined;
    userUpdateForm:FormGroup;


    constructor(
        private translate: TranslateService,
        private kpiService: KpiService,
        private cdr: ChangeDetectorRef
    ) { 
        this.userUpdateForm = new FormGroup({
            name: new FormControl('', Validators.required),
            sName: new FormControl('')
        });
    }

    ngOnInit(): void {
        this.userId$.subscribe(userId => {
            if(userId){
                this.kpiService.getUser(userId).subscribe(user => {
                    this.currentUser = user;
                    if(!!user){
                        this.initViewForUser(user);
                    }
                });
            }
        });
        this.kpis$ = this.kpiService.getAll();
    }

    doUpdate(): void {
        if(this.userUpdateForm.valid && !!this.currentUser){
            const updatedUser: User = {
                ...this.currentUser,
                name: this.userUpdateForm.get('name')?.value.trim(),
                sName: this.userUpdateForm.get('sName')?.value.trim()
            };
            this.kpiService.updateUser(updatedUser).subscribe(() => {
                this.currentUser = updatedUser;
                this.onDialogClose();
            });
        }
    }
    removeKpiFromUser(kpi: Kpi): void {
        if(!!this.currentUser && !!this.currentUser.kpis){
            const updatedKpis = this.currentUser.kpis.filter(k => k.id !== kpi.id);
            const updatedUser: User = {
                ...this.currentUser,
                kpis: updatedKpis
            };
            this.currentUser = updatedUser;
            this.cdr.detectChanges();
        }
    }

    addKpiToUser(kpi: Kpi): void {
        if(!!this.currentUser){
            const updatedKpis = !!this.currentUser.kpis ? [...this.currentUser.kpis, kpi] : [kpi];
            const updatedUser: User = {
                ...this.currentUser,
                kpis: updatedKpis
            };
            this.currentUser = updatedUser;
            this.cdr.detectChanges();
        }
    }

    private initViewForUser(user: User): void {
        this.userUpdateForm.patchValue({
            name: user.name,
            sName: user.sName
        });
    }

    getKpiValue(kpi: Kpi, isAsigned: boolean): string {
        if(!!kpi){
            if(isAsigned){
                let userKpi = this.getUserKpi(kpi.id);
                if(!!userKpi && userKpi.value !== undefined && userKpi.value !== null){
                    return `${userKpi.value.toString()} ${kpiUnitToString(userKpi.unit)}`;
                }
            }
            return `${kpi.value?.toString() ?? 'N/D'} ${kpiUnitToString(kpi.unit)}`;
        }
        return 'N/D';
    }

    getKpiTarget(kpi: Kpi, isAsigned: boolean): string {
        if(!!kpi){
            if(isAsigned){
                let userKpi = this.getUserKpi(kpi.id);
                if(!!userKpi && userKpi.target !== undefined && userKpi.target !== null){
                    return `${userKpi.target.toString()} ${kpiUnitToString(userKpi.unit)}`;
                }
            }
            return `${kpi.target?.toString() ?? 'N/D'} ${kpiUnitToString(kpi.unit)}`;
        }
        return 'N/D';
    }

    getUserKpi(id:string): Kpi | undefined {
        if(!!this.currentUser && !!this.currentUser.kpis){
            return this.currentUser.kpis.find(k => k.id === id);
        }
        return undefined;
    }

    getUserKpiValue(id: string): number | null {
        return this.getUserKpi(id)?.value ?? null;
    }

    onUserKpiValueChange(id: string, value: number | null): void {
        const userKpi = this.getUserKpi(id);
        if(userKpi){
            userKpi.value = value ?? undefined;
            this.cdr.markForCheck();
        }
    }

    getUserKpiTarget(id: string): number | null {
        return this.getUserKpi(id)?.target ?? null;
    }

    onUserKpiTargetChange(id: string, value: number | null): void {
        const userKpi = this.getUserKpi(id);
        if(userKpi){
            userKpi.target = value ?? undefined;
            this.cdr.markForCheck();
        }
    }

    isKpiAssignedToUser(kpi: Kpi): boolean {
        return !!this.currentUser && !!this.currentUser.kpis && this.currentUser.kpis.some(userKpi => userKpi.id === kpi.id);
    }

    onDialogClose(): void {
        this.showDialogChange.emit(false);
        this.kpiService.getUser(this.currentUser!.id).subscribe(user => {
            this.currentUser = user;
        });
    }

    getKpiTagSeverity(kpi: Kpi, isAssigned: boolean): "success" | "secondary" | "info" | "warn" | "danger" | "contrast" | null | undefined {
        if(isAssigned){
            let userKpi = this.getUserKpi(kpi.id);
            if(!!userKpi){
                if(!!userKpi.value && !!userKpi.target){
                    if(userKpi.value >= userKpi.target){
                        return 'success';
                    } else if(userKpi.value >= userKpi.target * 0.8){
                        return 'warn';
                    } else {
                        return 'danger';
                    }
                }else{
                    return 'secondary';
                }
            }else{
                return 'secondary';
            }
        }
        return 'secondary';

    }
}
