import { version } from 'uuid';
import { LogLevel } from '../app/core/model/app.model';

export const environment = {
  name: 'production',
  production: true,
  defaultLanguage: 'it',
  availableLanguages: ['en', 'it'],
  useHashLocation: true,
  logLevel: LogLevel.ERROR,
  version: '1.0.1',
  author: 'Yuliy Khlyebnikov',
} as const;