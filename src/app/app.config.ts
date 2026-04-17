import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideTranslateService, provideTranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader, provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import Lara from '@primeuix/themes/lara';
import { DialogService } from 'primeng/dynamicdialog';

import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import { LOG_LEVEL } from './core/utils/app.utils';
import { LogService } from './core/service/log.service';
import { LogLevel } from './core/model/app.model';
import { ConfirmationService, MessageService } from 'primeng/api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withHashLocation()),
    provideHttpClient(),
    provideTranslateService({
      lang: 'it',
      loader: provideTranslateLoader(TranslateHttpLoader)
    }),
    ...provideTranslateHttpLoader({ prefix: './i18n/', suffix: '.json' }),
    providePrimeNG({
        theme: {
            preset: Lara,
            options: {
              darkModeSelector: false
            }
        }
    }),
    [
      DialogService,
      MessageService,
      ConfirmationService,
      LogService,
      { provide: LOG_LEVEL, useValue: LogLevel.INFO }
    ]
  ]
};
