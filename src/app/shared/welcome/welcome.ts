import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';


@Component({
  selector: 'dash-welcome',
  imports: [
    TranslateModule, 
    ButtonModule
],
  templateUrl: './welcome.html',
  styleUrl: './welcome.scss',
})
export class WelcomeComponent {

    @Input() showNewKPIDialog: boolean = false;
    @Output() showNewKPIDialogChange = new EventEmitter<boolean>();


    newKPI(): void {
        this.showNewKPIDialogChange.emit(true);
    }

}
