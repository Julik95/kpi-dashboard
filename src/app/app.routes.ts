import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home', loadComponent: () => import('./shared/pages/home/home').then(m => m.HomeComponent)
  },
  {
    path: 'dashboard', loadComponent: () => import('./shared/pages/dashboard/dashboard').then(m => m.DashboardComponent)
  },
  {
    path: 'welcome', loadComponent: () => import('./shared/pages/welcome/welcome').then(m => m.WelcomePageComponent)
  },
  {
    path: 'about', loadComponent: () => import('./shared/pages/about/about').then(m => m.AboutComponent)
  },
  {
    path: '**', redirectTo: '/home'
  }
];
