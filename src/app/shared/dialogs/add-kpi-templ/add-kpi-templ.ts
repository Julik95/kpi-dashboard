import { Component, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Kpi, User } from '../../../core/model/kpi.model';
import { Observable } from 'rxjs/internal/Observable';
import { KpiService } from '../../../core/service/kpi.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { FloatLabelModule } from 'primeng/floatlabel';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-add-kpi-templ',
  imports: [TranslateModule, ReactiveFormsModule, FormsModule, AsyncPipe, ButtonModule, MultiSelectModule, FloatLabelModule],
  templateUrl: './add-kpi-templ.html',
  styleUrl: './add-kpi-templ.scss',
})
export class AddKpiTemplComponent implements OnInit {

    currentUser: User | null = null;
    newKpiFG: FormGroup;

    kpis: BehaviorSubject<Kpi[]> = new BehaviorSubject<Kpi[]>([]);
    kpis$: Observable<Kpi[]> = this.kpis.asObservable();

    constructor(
        public config: DynamicDialogConfig,
        public ref: DynamicDialogRef,
        private kpiService: KpiService,
        private translate: TranslateService 
    ) { 
        this.newKpiFG = new FormGroup({
            selectedKpis: new FormControl<Kpi[]>([], Validators.required)
        });
    } 

    onSubmit(): void {
        if(this.newKpiFG.valid && !!this.currentUser){
            const selectedKpis = this.newKpiFG.get('selectedKpis')?.value || [];
            this.currentUser.kpis = [...(this.currentUser.kpis || []), ...selectedKpis];
            this.kpiService.updateUser(this.currentUser).subscribe(() => {
                this.ref.close();
            });
        }
    }

    onDialogClose(): void {
        this.newKpiFG.reset();
        this.ref.close();   
    }

    ngOnInit(): void {
        if(!!this.config.data?.user){
            this.currentUser = this.config.data.user;
            this.kpiService.getAll().subscribe(kpis => {
                const userKpiIds = this.currentUser?.kpis?.map(k => k.id) || [];
                const filteredKpis = kpis.filter(k => !userKpiIds.includes(k.id));
                this.kpis.next(filteredKpis);
            });
        }
    }
}
