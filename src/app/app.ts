import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref, RouterLinkActive } from '@angular/router';
import { UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLinkWithHref, RouterLinkActive, UpperCasePipe, TranslateModule, FormsModule, ToggleButtonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly langs = environment.availableLanguages;

  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
  }

  switchLang(lang: string): void {
    this.translate.use(lang);
  }

  currentLang(): string {
    return this.translate.currentLang ?? environment.defaultLanguage;
  }


  get footerContent(): string {
    return this.translate.instant('FOOTER.CONTENT', {'YEAR': new Date().getFullYear(), 'AUTHOR': environment.author, 'APP_VERSION': environment.version });
  }

}
