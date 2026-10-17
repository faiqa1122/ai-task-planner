import { Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { PlannerService } from '../../core/planner.service';
import { GoalSummary, PlannedTask, Priority } from '../../core/models';

@Component({
  selector: 'app-planner',
  imports: [ReactiveFormsModule],
  template: `
    <div class="mx-auto max-w-4xl p-6">
      
      <!-- Step 1: goal form -->
      <form [formGroup]="form" (ngSubmit)="generate()" class="mt-6 space-y-4 rounded-2xl bg-white p-6 shadow">
        <h2 class="text-lg font-semibold text-gray-800">What is your goal?</h2>

        <div>
          <label class="block text-sm font-medium text-gray-700">Goal</label>
          <input
            type="text"
            formControlName="title"
            placeholder="e.g. Finish my final year project in 6 weeks"
            class="mt-1 w-full rounded-lg border border-gray-300 p-2 focus:border-indigo-500 focus:outline-none"
          />
          @if (form.controls.title.touched && form.controls.title.invalid) {
            <p class="mt-1 text-xs text-red-600">Goal must be 5 to 200 characters.</p>
          }
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Details (optional)</label>
          <textarea
            formControlName="description"
            rows="3"
            placeholder="e.g. Angular and .NET web app, I can work 2 hours daily"
            class="mt-1 w-full rounded-lg border border-gray-300 p-2 focus:border-indigo-500 focus:outline-none"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Deadline (optional)</label>
          <input
            type="date"
            formControlName="deadline"
            class="mt-1 rounded-lg border border-gray-300 p-2 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          [disabled]="generating() || saving()"
          class="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {{ generating() ? 'AI is planning...' : 'Generate plan' }}
        </button>
      </form>

      @if (error()) {
        <p class="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{{ error() }}</p>
      }

      <!-- Step 3: saved message -->
      @if (saved(); as goal) {
        <div class="mt-6 rounded-2xl bg-green-50 p-6 text-green-800">
          <p class="font-semibold">Plan saved!</p>
          <p class="mt-1 text-sm">"{{ goal.title }}" was saved with {{ goal.taskCount }} tasks.</p>
          <button
            (click)="reset()"
            class="mt-3 rounded-lg border border-green-600 px-3 py-1 text-sm hover:bg-green-100"
          >
            Plan another goal
          </button>
        </div>
      }

      <!-- Step 2: preview and edit -->
      @if (hasPreview() && !saved()) {
        <div class="mt-6 rounded-2xl bg-white p-6 shadow">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-800">Review your plan</h2>
            <span class="text-sm text-gray-500">{{ tasks().length }} tasks, {{ totalHours() }} hours</span>
          </div>
          <p class="mt-1 text-sm text-gray-500">Edit anything you want, then save.</p>

          <div class="mt-4 space-y-3">
            @for (t of tasks(); track $index) {
              <div class="rounded-xl border border-gray-200 p-3">
                <div class="flex gap-2">
                  <input
                    type="text"
                    [value]="t.title"
                    (input)="updateTask($index, { title: text($event) })"
                    placeholder="Task title"
                    class="flex-1 rounded-lg border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                  <select
                    (change)="updateTask($index, { priority: priority($event) })"
                    class="rounded-lg border border-gray-300 p-2 text-sm"
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
                    class="w-20 rounded-lg border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    (click)="removeTask($index)"
                    class="rounded-lg px-2 text-red-600 hover:bg-red-50"
                    aria-label="Remove task"
                  >
                    ✕
                  </button>
                </div>
                @if (t.description) {
                  <p class="mt-2 text-xs text-gray-500">{{ t.description }}</p>
                }
              </div>
            }
          </div>

          <div class="mt-4 flex gap-3">
            <button
              type="button"
              (click)="addTask()"
              class="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100"
            >
              + Add task
            </button>
            <button
              type="button"
              (click)="save()"
              [disabled]="saving() || generating()"
              class="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
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