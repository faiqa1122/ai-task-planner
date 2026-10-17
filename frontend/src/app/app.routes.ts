import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/layout.component').then((m) => m.LayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'planner' },
      {
        path: 'planner',
        loadComponent: () =>
          import('./features/planner/planner.component').then((m) => m.PlannerComponent),
      },
      {
        path: 'goals',
        loadComponent: () =>
          import('./features/goals/goals-list.component').then((m) => m.GoalsListComponent),
      },
      {
        path: 'goals/:id',
        loadComponent: () =>
          import('./features/goals/goal-detail.component').then((m) => m.GoalDetailComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'planner' },
];