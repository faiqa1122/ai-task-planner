import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { GoalsService } from '../../core/goals.service';
import { GoalSummary, Priority, TaskItem, TaskStatus } from '../../core/models';

@Component({
  selector: 'app-goal-detail',
  imports: [RouterLink, DatePipe],
  template: `
    <a routerLink="/goals" class="text-sm text-indigo-600 hover:underline">← Back to goals</a>

    @if (loading()) {
      <p class="mt-4 text-gray-500">Loading...</p>
    } @else if (goal()) {
      <div class="mt-3 rounded-2xl bg-white p-5 shadow">
        <h1 class="text-xl font-semibold text-gray-800">{{ goal()!.title }}</h1>
        @if (goal()!.description) {
          <p class="mt-1 text-sm text-gray-600">{{ goal()!.description }}</p>
        }
        @if (goal()!.deadline) {
          <p class="mt-1 text-xs text-gray-500">
            Deadline: {{ goal()!.deadline | date: 'mediumDate' }}
          </p>
        }
        <div class="mt-3 h-2 rounded-full bg-gray-200">
          <div class="h-2 rounded-full bg-indigo-600" [style.width.%]="percent()"></div>
        </div>
        <p class="mt-1 text-xs text-gray-500">
          {{ doneCount() }} of {{ tasks().length }} tasks done ({{ percent() }}%)
        </p>
      </div>

      @if (error()) {
        <p class="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{{ error() }}</p>
      }

      <div class="mt-4 grid gap-4 md:grid-cols-3">
        @for (col of columns(); track col.status) {
          <div class="rounded-2xl bg-gray-100 p-3">
            <h2 class="mb-3 flex justify-between text-sm font-semibold text-gray-700">
              <span>{{ col.label }}</span>
              <span>{{ col.items.length }}</span>
            </h2>

            <div class="space-y-3">
              @for (t of col.items; track t.id) {
                <div class="rounded-xl bg-white p-3 shadow-sm">
                  @if (editingId() === t.id) {
                    <input
                      type="text"
                      [value]="editTitle()"
                      (input)="editTitle.set(text($event))"
                      class="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:outline-none"
                    />
                    <div class="mt-2 flex gap-2">
                      <select
                        (change)="editPriority.set(priority($event))"
                        class="rounded-lg border border-gray-300 p-2 text-sm"
                      >
                        @for (p of priorities; track p) {
                          <option [value]="p" [selected]="editPriority() === p">{{ p }}</option>
                        }
                      </select>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        [value]="editHours() ?? ''"
                        (input)="editHours.set(num($event))"
                        placeholder="Hours"
                        class="w-20 rounded-lg border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div class="mt-2 flex gap-2">
                      <button
                        (click)="saveEdit(t)"
                        class="rounded-lg bg-indigo-600 px-3 py-1 text-xs text-white hover:bg-indigo-700"
                      >
                        Save
                      </button>
                      <button
                        (click)="editingId.set(null)"
                        class="rounded-lg border border-gray-300 px-3 py-1 text-xs hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                    </div>
                  } @else {
                    <p class="text-sm font-medium text-gray-800">{{ t.title }}</p>
                    @if (t.description) {
                      <p class="mt-1 text-xs text-gray-500">{{ t.description }}</p>
                    }
                    <div class="mt-2 flex items-center gap-2 text-xs">
                      <span [class]="badge(t.priority)">{{ t.priority }}</span>
                      @if (t.estimatedHours) {
                        <span class="text-gray-500">{{ t.estimatedHours }}h</span>
                      }
                    </div>
                    <div class="mt-2 flex items-center justify-between">
                      <div class="flex gap-1">
                        @if (canMove(t, -1)) {
                          <button
                            (click)="move(t, -1)"
                            class="rounded border border-gray-300 px-2 text-sm hover:bg-gray-100"
                            aria-label="Move back"
                          >
                            ←
                          </button>
                        }
                        @if (canMove(t, 1)) {
                          <button
                            (click)="move(t, 1)"
                            class="rounded border border-gray-300 px-2 text-sm hover:bg-gray-100"
                            aria-label="Move forward"
                          >
                            →
                          </button>
                        }
                      </div>
                      <div class="flex gap-1">
                        <button
                          (click)="startEdit(t)"
                          class="rounded px-2 text-sm text-gray-600 hover:bg-gray-100"
                          aria-label="Edit task"
                        >
                          ✎
                        </button>
                        <button
                          (click)="removeTask(t)"
                          class="rounded px-2 text-sm text-red-600 hover:bg-red-50"
                          aria-label="Delete task"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        }
      </div>

      <div class="mt-4 flex gap-2 rounded-2xl bg-white p-4 shadow">
        <input
          type="text"
          [value]="newTitle()"
          (input)="newTitle.set(text($event))"
          (keyup.enter)="addTask()"
          placeholder="Add a new task..."
          class="flex-1 rounded-lg border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:outline-none"
        />
        <button
          (click)="addTask()"
          class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Add
        </button>
      </div>
    } @else {
      <p class="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{{ error() }}</p>
    }
  `,
})
export class GoalDetailComponent implements OnInit {
  private api = inject(GoalsService);
  private route = inject(ActivatedRoute);

  readonly priorities: Priority[] = ['Low', 'Medium', 'High'];
  readonly statuses: TaskStatus[] = ['Todo', 'InProgress', 'Done'];
  private readonly labels: Record<TaskStatus, string> = {
    Todo: 'To do',
    InProgress: 'In progress',
    Done: 'Done',
  };

  goal = signal<GoalSummary | null>(null);
  tasks = signal<TaskItem[]>([]);
  loading = signal(true);
  error = signal('');

  editingId = signal<number | null>(null);
  editTitle = signal('');
  editPriority = signal<Priority>('Medium');
  editHours = signal<number | null>(null);
  newTitle = signal('');

  columns = computed(() =>
    this.statuses.map((s) => ({
      status: s,
      label: this.labels[s],
      items: this.tasks().filter((t) => t.status === s),
    }))
  );

  doneCount = computed(() => this.tasks().filter((t) => t.status === 'Done').length);

  percent = computed(() => {
    const total = this.tasks().length;
    return total === 0 ? 0 : Math.round((this.doneCount() / total) * 100);
  });

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    forkJoin({ goal: this.api.getGoal(id), tasks: this.api.getTasks(id) }).subscribe({
      next: (res) => {
        this.goal.set(res.goal);
        this.tasks.set(res.tasks);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(err.status === 404 ? 'Goal not found.' : 'Could not load this goal.');
      },
    });
  }

  canMove(t: TaskItem, dir: number): boolean {
    const i = this.statuses.indexOf(t.status) + dir;
    return i >= 0 && i < this.statuses.length;
  }

  move(t: TaskItem, dir: number) {
    const next = this.statuses[this.statuses.indexOf(t.status) + dir];
    this.error.set('');

    this.api.changeStatus(t.id, next).subscribe({
      next: (updated) => this.replace(updated),
      error: () => this.error.set('Could not change the status.'),
    });
  }

  startEdit(t: TaskItem) {
    this.editingId.set(t.id);
    this.editTitle.set(t.title);
    this.editPriority.set(t.priority);
    this.editHours.set(t.estimatedHours);
  }

  saveEdit(t: TaskItem) {
    const title = this.editTitle().trim();
    if (!title) {
      this.error.set('Task title cannot be empty.');
      return;
    }
    this.error.set('');

    this.api
      .updateTask(t.id, {
        title,
        description: t.description,
        priority: this.editPriority(),
        estimatedHours: this.editHours(),
        dueDate: t.dueDate,
        status: t.status,
      })
      .subscribe({
        next: (updated) => {
          this.replace(updated);
          this.editingId.set(null);
        },
        error: () => this.error.set('Could not save the task.'),
      });
  }

  addTask() {
    const title = this.newTitle().trim();
    if (!title) return;
    this.error.set('');

    this.api
      .addTask(this.goal()!.id, {
        title,
        description: null,
        priority: 'Medium',
        estimatedHours: null,
        dueDate: null,
        status: 'Todo',
      })
      .subscribe({
        next: (created) => {
          this.tasks.update((list) => [...list, created]);
          this.newTitle.set('');
        },
        error: () => this.error.set('Could not add the task.'),
      });
  }

  removeTask(t: TaskItem) {
    if (!confirm(`Delete "${t.title}"?`)) return;

    this.api.deleteTask(t.id).subscribe({
      next: () => this.tasks.update((list) => list.filter((x) => x.id !== t.id)),
      error: () => this.error.set('Could not delete the task.'),
    });
  }

  badge(p: Priority): string {
    switch (p) {
      case 'High':
        return 'rounded-full bg-red-100 px-2 py-0.5 text-red-700';
      case 'Medium':
        return 'rounded-full bg-amber-100 px-2 py-0.5 text-amber-700';
      default:
        return 'rounded-full bg-green-100 px-2 py-0.5 text-green-700';
    }
  }

  text(e: Event): string {
    return (e.target as HTMLInputElement).value;
  }

  num(e: Event): number | null {
    const v = (e.target as HTMLInputElement).value;
    return v === '' ? null : Number(v);
  }

  priority(e: Event): Priority {
    return (e.target as HTMLSelectElement).value as Priority;
  }

  private replace(updated: TaskItem) {
    this.tasks.update((list) => list.map((t) => (t.id === updated.id ? updated : t)));
  }
}