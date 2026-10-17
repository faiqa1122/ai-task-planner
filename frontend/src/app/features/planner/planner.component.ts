import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-planner',
  template: `
    <div class="mx-auto max-w-3xl p-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-indigo-600">AI Task Planner</h1>
        <button
          (click)="auth.logout()"
          class="rounded-lg border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100"
        >
          Log out
        </button>
      </div>
      <p class="mt-6 text-gray-700">Welcome, {{ auth.user()?.name }}!</p>
    </div>
  `,
})
export class PlannerComponent {
  auth = inject(AuthService);
}