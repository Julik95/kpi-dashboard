import { LogLevel } from '../app/core/model/app.model';

export const environment = {
  name: 'development',
  production: false,
  defaultLanguage: 'it',
  availableLanguages: ['en', 'it'],
  useHashLocation: true,
  logLevel: LogLevel.INFO,
  version: '1.0.1',
  author: 'Yuliy Khlyebnikov'
} as const;