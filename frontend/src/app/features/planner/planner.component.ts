import { Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { PlannerService } from '../../core/planner.service';
import { GoalSummary, PlannedTask, Priority } from '../../core/models';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-planner',
  imports: [ReactiveFormsModule],
  template: `
   <div class="space-y-6">
  <div>
    <p class="label">New plan</p>
    <h1 class="mt-1 text-3xl font-semibold">What is your goal?</h1>
  </div>

  <form [formGroup]="form" (ngSubmit)="generate()" class="panel space-y-4">
    <div>
      <label class="label">Goal</label>
      <input
        type="text"
        formControlName="title"
        placeholder="e.g. Finish my final year project in 6 weeks"
        class="field"
      />
      @if (form.controls.title.touched && form.controls.title.invalid) {
        <p class="error-text mt-1">Goal must be 5 to 200 characters.</p>
      }
    </div>

    <div>
      <label class="label">Details (optional)</label>
      <textarea
        formControlName="description"
        rows="3"
        placeholder="e.g. Angular and .NET web app, I can work 2 hours daily"
        class="field"
      ></textarea>
    </div>

    <div>
      <label class="label">Deadline (optional)</label>
      <input type="date" formControlName="deadline" class="field w-auto" />
    </div>

    <button type="submit" [disabled]="generating() || saving()" class="btn">
      {{ generating() ? 'AI is planning...' : 'Generate plan' }}
    </button>
  </form>

  @if (error()) {
    <p class="error-box">{{ error() }}</p>
  }

  @if (saved(); as goal) {
    <div class="panel border-accent/40">
      <p class="font-semibold text-accent">Plan saved</p>
      <p class="mt-1 text-sm text-muted">"{{ goal.title }}" was saved with {{ goal.taskCount }} tasks.</p>
      <button (click)="reset()" class="btn-ghost mt-3">Plan another goal</button>
    </div>
  }

  @if (hasPreview() && !saved()) {
    <div class="panel">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">Review your plan</h2>
        <span class="text-sm text-muted">{{ tasks().length }} tasks, {{ totalHours() }} hours</span>
      </div>
      <p class="mt-1 text-sm text-muted">Edit anything you want, then save.</p>

      <div class="mt-4 space-y-3">
        @for (t of tasks(); track $index) {
          <div class="card">
            <div class="flex gap-2">
              <input
                type="text"
                [value]="t.title"
                (input)="updateTask($index, { title: text($event) })"
                placeholder="Task title"
                class="field mt-0 flex-1"
              />
              <select
                (change)="updateTask($index, { priority: priority($event) })"
                class="field mt-0 w-auto"
              >
                @for (p of priorities; track p) {
                  <option [value]="p" [selected]="t.priority === p">{{ p }}</option>
                }
              </select>
              <input
                type="number"
                min="0"
                step="0.5"
                [value]="t.estimatedHours ?? ''"
                (input)="updateTask($index, { estimatedHours: num($event) })"
                placeholder="Hours"
                class="field mt-0 w-20"
              />
              <button
                type="button"
                (click)="removeTask($index)"
                class="rounded-lg px-2 text-high hover:bg-high-bg"
                aria-label="Remove task"
              >
                ✕
              </button>
            </div>
            @if (t.description) {
              <p class="mt-2 text-xs text-muted">{{ t.description }}</p>
            }
          </div>
        }
      </div>

      <div class="mt-4 flex gap-3">
        <button type="button" (click)="addTask()" class="btn-ghost">+ Add task</button>
        <button type="button" (click)="save()" [disabled]="saving() || generating()" class="btn">
          {{ saving() ? 'Saving...' : 'Save plan' }}
        </button>
      </div>
    </div>
  }
</div>
  `,
})
export class PlannerComponent {
  auth = inject(AuthService);
  private planner = inject(PlannerService);
  private fb = inject(FormBuilder);
    private toast = inject(ToastService);

  readonly priorities: Priority[] = ['Low', 'Medium', 'High'];

  generating = signal(false);
  saving = signal(false);
  error = signal('');
  hasPreview = signal(false);
  tasks = signal<PlannedTask[]>([]);
  saved = signal<GoalSummary | null>(null);

  totalHours = computed(() =>
    this.tasks().reduce((sum, t) => sum + (t.estimatedHours ?? 0), 0)
  );

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
    description: ['', Validators.maxLength(1000)],
    deadline: [''],
  });

  generate() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    this.generating.set(true);
    this.error.set('');
    this.saved.set(null);

    this.planner
      .preview({
        title: v.title.trim(),
        description: v.description.trim() || null,
        deadline: v.deadline || null,
      })
      .subscribe({
        next: (res) => {
          this.tasks.set(res.tasks);
          this.hasPreview.set(true);
          this.generating.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.generating.set(false);
          this.error.set(this.messageFrom(err));
        },
      });
  }

  save() {
    const cleaned = this.tasks().filter((t) => t.title.trim().length > 0);
    if (cleaned.length === 0) {
      this.error.set('Add at least one task with a title.');
      return;
    }

    const v = this.form.getRawValue();
    this.saving.set(true);
    this.error.set('');

    this.planner
      .save({
        goal: {
          title: v.title.trim(),
          description: v.description.trim() || null,
          deadline: v.deadline || null,
        },
        tasks: cleaned.map((t) => ({
          ...t,
          title: t.title.trim(),
          status: 'Todo' as const,
        })),
      })
      .subscribe({
        next: (goal) => {
          this.saving.set(false);
          this.saved.set(goal);
           this.toast.success('Plan saved');
        },
        error: (err: HttpErrorResponse) => {
          this.saving.set(false);
          this.error.set(this.messageFrom(err));
        },
      });
  }

  reset() {
    this.form.reset();
    this.tasks.set([]);
    this.hasPreview.set(false);
    this.saved.set(null);
    this.error.set('');
  }

  updateTask(index: number, patch: Partial<PlannedTask>) {
    this.tasks.update((list) => list.map((t, i) => (i === index ? { ...t, ...patch } : t)));
  }

  addTask() {
    this.tasks.update((list) => [
      ...list,
      { title: '', description: null, priority: 'Medium', estimatedHours: null },
    ]);
  }

  removeTask(index: number) {
    this.tasks.update((list) => list.filter((_, i) => i !== index));
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

  private messageFrom(err: HttpErrorResponse): string {
    if (err.status === 0) return 'Cannot reach the server. Is the backend running?';
    if (err.error?.message) return err.error.message;
    if (err.status === 400) return 'Please check your input and try again.';
    return 'Something went wrong. Please try again.';
  }
}