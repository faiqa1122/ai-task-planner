import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { GoalsService } from '../../core/goals.service';
import { GoalSummary } from '../../core/models';
import { ConfirmService } from '../../core/confirm.service';
import { ToastService } from '../../core/toast.service';

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
      <div class="mt-6 grid gap-4 sm:grid-cols-2">
        @for (i of [1, 2, 3, 4]; track i) {
          <div class="panel space-y-3">
            <div class="skeleton h-5 w-2/3"></div>
            <div class="skeleton h-3 w-1/3"></div>
            <div class="skeleton h-2 w-full"></div>
            <div class="skeleton h-3 w-1/2"></div>
          </div>
        }
      </div>
    } @else if (error()) {
      <p class="error-box mt-6">{{ error() }}</p>
    } @else if (goals().length === 0) {
      <div class="panel mt-6 flex flex-col items-center py-14 text-center">
        <div class="flex h-14 w-14 items-center justify-center rounded-full bg-card text-accent">
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>
        <h2 class="mt-4 text-lg font-semibold">No goals yet</h2>
        <p class="mt-1 max-w-xs text-sm text-muted">
          Write a goal and the AI will turn it into a clear plan of tasks.
        </p>
        <a routerLink="/planner" class="btn mt-5">Create your first plan</a>
      </div>
    } @else {
      <div class="mt-6 grid gap-4 sm:grid-cols-2">
        @for (g of goals(); track g.id) {
          <div class="panel">
            <div class="flex items-start justify-between gap-3">
              <a [routerLink]="['/goals', g.id]" class="text-lg font-semibold hover:text-accent">{{
                g.title
              }}</a>
              <span class="text-2xl font-bold text-accent">{{ percent(g) }}%</span>
            </div>
            @if (g.deadline) {
              <p class="mt-1 text-xs text-muted">
                Deadline: {{ g.deadline | date: 'mediumDate' }}
              </p>
            }
            <div class="mt-4 h-2 rounded-full bg-line">
              <div class="h-2 rounded-full bg-accent" [style.width.%]="percent(g)"></div>
            </div>
            <p class="mt-2 text-xs text-muted">
              {{ g.doneCount }} of {{ g.taskCount }} tasks done
            </p>
            <div class="mt-4 flex gap-2">
              <a [routerLink]="['/goals', g.id]" class="btn-ghost">Open</a>
              <button
                (click)="remove(g)"
                class="rounded-lg px-3 py-2 text-sm text-high hover:bg-high-bg"
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
  private confirm = inject(ConfirmService);
  private toast = inject(ToastService);

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

  async remove(g: GoalSummary) {
    const ok = await this.confirm.ask({
      title: 'Delete goal?',
      message: `"${g.title}" and all its tasks will be deleted. This cannot be undone.`,
      confirmText: 'Delete',
      danger: true,
    });
    if (!ok) return;

    this.api.deleteGoal(g.id).subscribe({
      next: () => {
        this.goals.update((list) => list.filter((x) => x.id !== g.id));
        this.toast.success('Goal deleted');
      },
      error: () => this.toast.error('Could not delete the goal.'),
    });
  }
}