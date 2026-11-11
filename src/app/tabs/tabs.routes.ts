import type { Routes } from '@angular/router';

import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'registro',
        loadComponent: () => import('../features/registro/registro.page').then((m) => m.RegistroPage),
      },
      {
        path: 'candidatos',
        loadComponent: () => import('../features/candidatos/candidatos.page').then((m) => m.CandidatosPage),
      },
      {
        path: '',
        redirectTo: '/tabs/registro',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/registro',
    pathMatch: 'full',
  },
];
