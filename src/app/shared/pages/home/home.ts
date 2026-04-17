import { Component, OnInit } from "@angular/core";
import { KpiService } from "../../../core/service/kpi.service";
import { Router } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'dash-home',
  imports: [ProgressSpinnerModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent implements OnInit{

    showNewKPIDialog: boolean = false;

    constructor(
       private kpiService: KpiService,
       private router: Router
    ) {

    }

    ngOnInit(): void {
        this.kpiService.getAll().subscribe(kpis => {
            if(kpis.length > 0){
                this.router.navigate(['/dashboard']);
            }else{
                this.router.navigate(['/welcome']);
            }
        });
    }


}
