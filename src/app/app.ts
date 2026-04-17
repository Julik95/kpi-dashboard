import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLinkWithHref } from '@angular/router';
import { UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToggleButtonModule } from 'primeng/togglebutton';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLinkWithHref, UpperCasePipe, TranslateModule, FormsModule, ToggleButtonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly langs = ['en', 'it'];

  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
  }

  switchLang(lang: string): void {
    this.translate.use(lang);
  }

  currentLang(): string {
    return this.translate.currentLang ?? 'it';
  }


}
