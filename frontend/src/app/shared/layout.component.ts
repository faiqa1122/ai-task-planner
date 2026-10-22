import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ThemeToggleComponent } from './theme-toggle.component';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ThemeToggleComponent],
  template: `
   <div class="min-h-screen md:flex">
  <aside
    class="flex flex-wrap items-center gap-2 border-b border-line p-3 md:min-h-screen md:w-56 md:shrink-0 md:flex-col md:flex-nowrap md:items-stretch md:border-r md:border-b-0 md:p-5"
  >
    <a routerLink="/planner" class="px-2 text-xl font-bold md:mb-6">
      Task<span class="text-accent">Planner</span>
    </a>
    <nav class="flex gap-1 md:flex-col">
      <a routerLink="/planner" routerLinkActive="nav-link-active" class="nav-link">New plan</a>
      <a routerLink="/goals" routerLinkActive="nav-link-active" class="nav-link">My goals</a>
    </nav>
   <div class="ml-auto flex items-center gap-2 md:mt-auto md:ml-0 md:flex-col md:items-stretch">
  <div class="flex items-center justify-between gap-2">
   <span class="px-3 text-sm text-muted">{{ auth.user()?.['name'] }}</span>
    <app-theme-toggle />
  </div>
  <button (click)="auth.logout()" class="btn-ghost">Log out</button>
</div>
  </aside>
  <main class="flex-1 p-4 md:p-8">
    <div class="mx-auto max-w-5xl">
      <router-outlet />
    </div>
  </main>
</div>
  `,
})
export class LayoutComponent {
  auth = inject(AuthService);
}