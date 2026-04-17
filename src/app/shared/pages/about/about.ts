import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'dash-about',
    imports: [TranslateModule],
    templateUrl: './about.html',
    styleUrl: './about.scss',
})
export class AboutComponent {

    constructor() { }
}
