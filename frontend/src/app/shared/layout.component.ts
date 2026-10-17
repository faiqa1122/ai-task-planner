import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-gray-50">
      <header class="border-b bg-white">
        <div class="mx-auto flex max-w-5xl items-center justify-between p-4">
          <a routerLink="/planner" class="text-xl font-bold text-indigo-600">AI Task Planner</a>
          <nav class="flex items-center gap-4 text-sm">
            <a
              routerLink="/planner"
              routerLinkActive="font-semibold text-indigo-600"
              class="text-gray-600 hover:text-indigo-600"
              >New plan</a
            >
            <a
              routerLink="/goals"
              routerLinkActive="font-semibold text-indigo-600"
              class="text-gray-600 hover:text-indigo-600"
              >My goals</a
            >
            <span class="text-gray-500">{{ auth.user()?.name }}</span>
            <button
              (click)="auth.logout()"
              class="rounded-lg border border-gray-300 px-3 py-1 hover:bg-gray-100"
            >
              Log out
            </button>
          </nav>
        </div>
      </header>
      <main class="mx-auto max-w-5xl p-4">
        <router-outlet />
      </main>
    </div>
  `,
})
export class LayoutComponent {
  auth = inject(AuthService);
}