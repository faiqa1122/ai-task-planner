import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { GoalsService } from '../../core/goals.service';
import { GoalSummary, Priority, TaskItem, TaskStatus } from '../../core/models';
import { ConfirmService } from '../../core/confirm.service';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-goal-detail',
  imports: [RouterLink, DatePipe],
  template: `
    <a routerLink="/goals" class="text-sm text-muted hover:text-accent">← Back to goals</a>

    @if (loading()) {
      <div class="mt-4 space-y-3">
        <div class="skeleton h-3 w-16"></div>
        <div class="skeleton h-8 w-2/3"></div>
        <div class="skeleton h-2 w-full"></div>
      </div>
      <div class="mt-6 grid gap-4 md:grid-cols-3">
        @for (i of [1, 2, 3]; track i) {
          <div class="panel space-y-3 p-3.5">
            <div class="skeleton h-3 w-20"></div>
            <div class="skeleton h-24 w-full"></div>
            <div class="skeleton h-24 w-full"></div>
          </div>
        }
      </div>
    } @else if (goal()) {
      <div class="mt-4 flex items-end justify-between gap-4">
        <div>
          <p class="label">Goal</p>
          <h1 class="mt-1 text-3xl font-semibold">{{ goal()!.title }}</h1>
          @if (goal()!.description) {
            <p class="mt-1 text-sm text-muted">{{ goal()!.description }}</p>
          }
          @if (goal()!.deadline) {
            <p class="mt-1 text-xs text-muted">
              Deadline: {{ goal()!.deadline | date: 'mediumDate' }}
            </p>
          }
        </div>
        <div class="text-5xl leading-none font-bold text-accent">{{ percent() }}%</div>
      </div>

      <div class="mt-4 h-2 rounded-full bg-line">
        <div class="h-2 rounded-full bg-accent" [style.width.%]="percent()"></div>
      </div>
      <p class="mt-2 text-xs text-muted">{{ doneCount() }} of {{ tasks().length }} tasks done</p>

      @if (error()) {
        <p class="error-box mt-4">{{ error() }}</p>
      }

      <div class="mt-6 grid gap-4 md:grid-cols-3">
        @for (col of columns(); track col.status) {
          <div class="panel space-y-3 p-3.5">
            <h2
              class="flex justify-between text-xs font-semibold tracking-wider text-muted uppercase"
            >
              <span>{{ col.label }}</span>
              <span>{{ col.items.length }}</span>
            </h2>

            @for (t of col.items; track t.id) {
              <div class="card">
                @if (editingId() === t.id) {
                  <input
                    type="text"
                    [value]="editTitle()"
                    (input)="editTitle.set(text($event))"
                    class="field mt-0"
                  />
                  <div class="mt-2 flex gap-2">
                    <select
                      (change)="editPriority.set(priority($event))"
                      class="field mt-0 w-auto"
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
                      class="field mt-0 w-20"
                    />
                  </div>
                  <div class="mt-2 flex gap-2">
                    <button (click)="saveEdit(t)" class="btn px-3 py-1 text-xs">Save</button>
                    <button (click)="editingId.set(null)" class="btn-ghost px-3 py-1 text-xs">
                      Cancel
                    </button>
                  </div>
                } @else {
                  <p
                    class="text-sm font-semibold"
                    [class.text-muted]="t.status === 'Done'"
                    [class.line-through]="t.status === 'Done'"
                  >
                    {{ t.title }}
                  </p>
                  @if (t.description) {
                    <p class="mt-1 text-xs text-muted">{{ t.description }}</p>
                  }
                  <div class="mt-2 flex items-center gap-2 text-xs">
                    <span [class]="badge(t.priority)">{{ t.priority }}</span>
                    @if (t.estimatedHours) {
                      <span class="text-muted">{{ t.estimatedHours }}h</span>
                    }
                  </div>
                  <div class="mt-3 flex items-center justify-between">
                    <div class="flex gap-1">
                      @if (canMove(t, -1)) {
                        <button
                          (click)="move(t, -1)"
                          class="rounded-md border border-line-strong px-2 text-sm text-muted hover:text-ink"
                          aria-label="Move back"
                        >
                          ←
                        </button>
                      }
                      @if (canMove(t, 1)) {
                        <button
                          (click)="move(t, 1)"
                          class="rounded-md border border-line-strong px-2 text-sm text-muted hover:text-ink"
                          aria-label="Move forward"
                        >
                          →
                        </button>
                      }
                    </div>
                    <div class="flex gap-1">
                      <button
                        (click)="startEdit(t)"
                        class="rounded-md px-2 text-sm text-muted hover:text-ink"
                        aria-label="Edit task"
                      >
                        ✎
                      </button>
                      <button
                        (click)="removeTask(t)"
                        class="rounded-md px-2 text-sm text-high hover:bg-high-bg"
                        aria-label="Delete task"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                }
              </div>
            } @empty {
              <p class="px-1 py-6 text-center text-xs text-muted">No tasks here</p>
            }
          </div>
        }
      </div>

      <div class="panel mt-4 flex gap-2">
        <input
          type="text"
          [value]="newTitle()"
          (input)="newTitle.set(text($event))"
          (keyup.enter)="addTask()"
          placeholder="Add a new task..."
          class="field mt-0 flex-1"
        />
        <button (click)="addTask()" class="btn">Add</button>
      </div>
    } @else {
      <p class="error-box mt-4">{{ error() }}</p>
    }
  `,
})
export class GoalDetailComponent implements OnInit {
  private api = inject(GoalsService);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);
  private confirm = inject(ConfirmService);

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

    this.api.changeStatus(t.id, next).subscribe({
      next: (updated) => {
        this.replace(updated);
        this.toast.success(`Moved to ${this.labels[next]}`);
      },
      error: () => this.toast.error('Could not change the status.'),
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
      this.toast.error('Task title cannot be empty.');
      return;
    }

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
          this.toast.success('Task updated');
        },
        error: () => this.toast.error('Could not save the task.'),
      });
  }

  addTask() {
    const title = this.newTitle().trim();
    if (!title) return;

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
          this.toast.success('Task added');
        },
        error: () => this.toast.error('Could not add the task.'),
      });
  }

  async removeTask(t: TaskItem) {
    const ok = await this.confirm.ask({
      title: 'Delete task?',
      message: `"${t.title}" will be deleted.`,
      confirmText: 'Delete',
      danger: true,
    });
    if (!ok) return;

    this.api.deleteTask(t.id).subscribe({
      next: () => {
        this.tasks.update((list) => list.filter((x) => x.id !== t.id));
        this.toast.success('Task deleted');
      },
      error: () => this.toast.error('Could not delete the task.'),
    });
  }

  badge(p: Priority): string {
    switch (p) {
      case 'High':
        return 'chip chip-high';
      case 'Medium':
        return 'chip chip-medium';
      default:
        return 'chip chip-low';
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