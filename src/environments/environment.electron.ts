import { LogLevel } from '../app/core/model/app.model';

export const environment = {
  name: 'electron',
  production: true,
  defaultLanguage: 'it',
  availableLanguages: ['en', 'it'],
  useHashLocation: true,
  logLevel: LogLevel.WARNING,
  version: '1.0.1',
  author: 'Yuliy Khlyebnikov'
} as const;