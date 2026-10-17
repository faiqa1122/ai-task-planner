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
   <div class="flex items-end justify-between">
  <div>
    <p class="label">Overview</p>
    <h1 class="mt-1 text-3xl font-semibold">My goals</h1>
  </div>
  <a routerLink="/planner" class="btn">+ New plan</a>
</div>

@if (loading()) {
  <p class="mt-6 text-muted">Loading...</p>
} @else if (error()) {
  <p class="error-box mt-6">{{ error() }}</p>
} @else if (goals().length === 0) {
  <div class="panel mt-6 text-center">
    <p class="text-muted">You have no goals yet.</p>
    <a routerLink="/planner" class="mt-2 inline-block font-semibold text-accent hover:underline"
      >Create your first plan</a
    >
  </div>
} @else {
  <div class="mt-6 grid gap-4 sm:grid-cols-2">
    @for (g of goals(); track g.id) {
      <div class="panel">
        <div class="flex items-start justify-between gap-3">
          <a [routerLink]="['/goals', g.id]" class="text-lg font-semibold hover:text-accent">{{ g.title }}</a>
          <span class="text-2xl font-bold text-accent">{{ percent(g) }}%</span>
        </div>
        @if (g.deadline) {
          <p class="mt-1 text-xs text-muted">Deadline: {{ g.deadline | date: 'mediumDate' }}</p>
        }
        <div class="mt-4 h-2 rounded-full bg-line">
          <div class="h-2 rounded-full bg-accent" [style.width.%]="percent(g)"></div>
        </div>
        <p class="mt-2 text-xs text-muted">{{ g.doneCount }} of {{ g.taskCount }} tasks done</p>
        <div class="mt-4 flex gap-2">
          <a [routerLink]="['/goals', g.id]" class="btn-ghost">Open</a>
          <button (click)="remove(g)" class="rounded-lg px-3 py-2 text-sm text-high hover:bg-high-bg">
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