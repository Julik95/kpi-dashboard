import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { KpiService } from '../../../core/service/kpi.service';
import { SelectModule } from 'primeng/select';
import { catchError } from 'rxjs';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'dash-kpi-dialog',
  imports: [TranslateModule, ButtonModule, SelectModule, DialogModule, InputTextModule, FloatLabelModule, FormsModule, ReactiveFormsModule, InputNumberModule],
  templateUrl: './kpi-dialog.html',
  styleUrl: './kpi-dialog.scss',
})
export class KpiDialogComponent {

    newKPIForm: FormGroup;
    @Output() onClose = new EventEmitter<void>();
    @Output() showDialogChange = new EventEmitter<boolean>();

    @Input() showDialog: boolean = false;

    readonly kpiUnitOptions;

    constructor(
        private translate: TranslateService,
        private kpiService: KpiService,
        private messageService: MessageService
    ) {
        this.newKPIForm = new FormGroup({
            kpiName: new FormControl('', Validators.required),
            kpiTargetValue: new FormControl(0),
            kpiUnit: new FormControl('', Validators.required)
        });
        this.kpiUnitOptions = [
            { label: this.translate.instant('HOME.DASHBOARD.ADD_NEW_KPI_DIALOG.KPI_UNIT_PERCENTAGE'), value: 'PERCENTAGE' },
            { label: this.translate.instant('HOME.DASHBOARD.ADD_NEW_KPI_DIALOG.KPI_UNIT_CURRENCY'), value: 'CURRENCY' },
            { label: this.translate.instant('HOME.DASHBOARD.ADD_NEW_KPI_DIALOG.KPI_UNIT_ABSOLUTE'), value: 'ABSOLUTE' }
        ];
    }

    onDialogClose(): void {
        this.newKPIForm.reset();
        this.showDialogChange.emit(false);
        this.onClose.emit();
    }

    onSubmit(): void {
        if (this.newKPIForm.valid) {
            const kpiName = this.newKPIForm.get('kpiName')?.value.trim();
            this.kpiService.setKpi(
                kpiName,  
                0,
                this.newKPIForm.get('kpiTargetValue')?.value ? parseFloat(this.newKPIForm.get('kpiTargetValue')?.value) : 0,
                this.newKPIForm.get('kpiUnit')?.value
            ).pipe(
                catchError(error => {
                    this.messageService.add({severity:'error', summary:this.translate.instant('HOME.MESSAGES.KPI_CREATION_ERROR', {KPI_NAME: kpiName}), detail: ''});
                    throw error;
                })
            ).subscribe(id => {
                this.messageService.add({severity:'success', summary:this.translate.instant('HOME.MESSAGES.KPI_CREATED', {KPI_NAME: kpiName}), detail: ''});
            });
            this.onDialogClose();
        }
    }
    
    


}
