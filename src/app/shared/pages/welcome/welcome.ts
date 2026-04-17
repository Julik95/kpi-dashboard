import { Component, OnInit } from "@angular/core";
import { WelcomeComponent } from "../../welcome/welcome";
import { KpiDialogComponent } from "../../dialogs/kpi-dialog/kpi-dialog";

@Component({
  selector: 'app-welcome',
  imports: [WelcomeComponent, KpiDialogComponent],
  templateUrl: './welcome.html',
  styleUrl: './welcome.scss',
})
export class WelcomePageComponent {

    showNewKPIDialog: boolean = false;
}
