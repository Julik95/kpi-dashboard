import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { Observable } from 'rxjs/internal/Observable';
import { AsyncPipe } from '@angular/common';
import { KpiService } from '../../../core/service/kpi.service';
import { Kpi, User } from '../../../core/model/kpi.model';
import { MessageService } from 'primeng/api';
import { catchError } from 'rxjs';

@Component({
  selector: 'dash-user-dialog',
  imports: [DialogModule, TranslateModule, InputTextModule, AsyncPipe, FloatLabelModule, FormsModule, ReactiveFormsModule, ButtonModule, MultiSelectModule],
  templateUrl: './user-dialog.html',
  styleUrl: './user-dialog.scss',
})
export class UserDialogComponent {

    newUserForm: FormGroup;
    
    @Output() onClose = new EventEmitter<void>();
    @Output() showDialogChange = new EventEmitter<boolean>();
    @Output() userCreated = new EventEmitter<User>();
    @Input() kpis$: Observable<Kpi[]> = new Observable<Kpi[]>();

    @Input() showDialog: boolean = false;

    constructor(
        private kpiService: KpiService,
        private translate: TranslateService,
        private messageService: MessageService
    ) {
        this.newUserForm = new FormGroup({
            userName: new FormControl('', Validators.required),
            userSName: new FormControl(''),
            assignedKpis: new FormControl(null)
        });
    }

    onSubmit(): void {
        if (this.newUserForm.valid) {
            const userName = this.newUserForm.get('userName')?.value.trim();
            const sName = this.newUserForm.get('userSName')?.value.trim();
            this.kpiService.setUser(
                userName,  
                sName,
                this.newUserForm.get('assignedKpis')?.value
            ).pipe(
                catchError(error => {
                    this.messageService.add({severity:'error', summary:this.translate.instant('HOME.MESSAGES.USER_CREATION_ERROR', {USER_NAME: userName}), detail: ''});
                    throw error;
                })
            ).subscribe((user: User) => {
                this.messageService.add({severity:'success', summary:this.translate.instant('HOME.MESSAGES.USER_CREATED', {USER_NAME: userName}), detail: ''});
                this.userCreated.emit(user);
                this.onDialogClose();
            });
        }
    }

    onDialogClose(): void {
        this.newUserForm.reset();
        this.showDialogChange.emit(false);
        this.onClose.emit();
    }
}   

    