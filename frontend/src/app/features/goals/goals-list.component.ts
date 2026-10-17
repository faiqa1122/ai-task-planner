import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { GoalsService } from '../../core/goals.service';
import { GoalSummary } from '../../core/models';

@Component({
  selector: 'app-goals-list',
  imports: [RouterLink, DatePipe],
  template: `
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-semibold text-gray-800">My goals</h1>
      <a
        routerLink="/planner"
        class="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >+ New plan</a
      >
    </div>

    @if (loading()) {
      <p class="mt-6 text-gray-500">Loading...</p>
    } @else if (error()) {
      <p class="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">{{ error() }}</p>
    } @else if (goals().length === 0) {
      <div class="mt-6 rounded-2xl bg-white p-8 text-center shadow">
        <p class="text-gray-600">You have no goals yet.</p>
        <a routerLink="/planner" class="mt-2 inline-block text-indigo-600 hover:underline"
          >Create your first plan</a
        >
      </div>
    } @else {
      <div class="mt-4 grid gap-4 sm:grid-cols-2">
        @for (g of goals(); track g.id) {
          <div class="rounded-2xl bg-white p-5 shadow">
            <a
              [routerLink]="['/goals', g.id]"
              class="text-lg font-semibold text-gray-800 hover:text-indigo-600"
              >{{ g.title }}</a
            >
            @if (g.deadline) {
              <p class="mt-1 text-xs text-gray-500">Deadline: {{ g.deadline | date: 'mediumDate' }}</p>
            }
            <div class="mt-3 h-2 rounded-full bg-gray-200">
              <div class="h-2 rounded-full bg-indigo-600" [style.width.%]="percent(g)"></div>
            </div>
            <p class="mt-1 text-xs text-gray-500">{{ g.doneCount }} of {{ g.taskCount }} tasks done</p>
            <div class="mt-3 flex gap-2">
              <a
                [routerLink]="['/goals', g.id]"
                class="rounded-lg border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100"
                >Open</a
              >
              <button
                (click)="remove(g)"
                class="rounded-lg px-3 py-1 text-sm text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        }
      </div>
    }
  `,
})
export class GoalsListComponent {
  private api = inject(GoalsService);

  goals = signal<GoalSummary[]>([]);
  loading = signal(true);
  error = signal('');

  constructor() {
    this.api.getGoals().subscribe({
      next: (list) => {
        this.goals.set(list);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(err.status === 0 ? 'Cannot reach the server.' : 'Could not load goals.');
      },
    });
  }

  percent(g: GoalSummary): number {
    return g.taskCount === 0 ? 0 : Math.round((g.doneCount / g.taskCount) * 100);
  }

  remove(g: GoalSummary) {
    if (!confirm(`Delete "${g.title}" and all its tasks?`)) return;

    this.api.deleteGoal(g.id).subscribe({
      next: () => this.goals.update((list) => list.filter((x) => x.id !== g.id)),
      error: () => this.error.set('Could not delete the goal.'),
    });
  }
}