import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div class="w-full max-w-md rounded-2xl bg-white p-8 shadow">
        <h1 class="text-2xl font-bold text-indigo-600">AI Task Planner</h1>
        <p class="mt-1 text-sm text-gray-500">Create your account</p>

        <form [formGroup]="form" (ngSubmit)="submit()" class="mt-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              formControlName="name"
              class="mt-1 w-full rounded-lg border border-gray-300 p-2 focus:border-indigo-500 focus:outline-none"
            />
            @if (form.controls.name.touched && form.controls.name.invalid) {
              <p class="mt-1 text-xs text-red-600">Name is required.</p>
            }
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              formControlName="email"
              class="mt-1 w-full rounded-lg border border-gray-300 p-2 focus:border-indigo-500 focus:outline-none"
            />
            @if (form.controls.email.touched && form.controls.email.invalid) {
              <p class="mt-1 text-xs text-red-600">Enter a valid email.</p>
            }
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              formControlName="password"
              class="mt-1 w-full rounded-lg border border-gray-300 p-2 focus:border-indigo-500 focus:outline-none"
            />
            @if (form.controls.password.touched && form.controls.password.invalid) {
              <p class="mt-1 text-xs text-red-600">Password must be at least 6 characters.</p>
            }
          </div>

          @if (error()) {
            <p class="rounded-lg bg-red-50 p-2 text-sm text-red-700">{{ error() }}</p>
          }

          <button
            type="submit"
            [disabled]="loading()"
            class="w-full rounded-lg bg-indigo-600 p-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {{ loading() ? 'Creating account...' : 'Register' }}
          </button>
        </form>

        <p class="mt-4 text-center text-sm text-gray-600">
          Already have an account?
          <a routerLink="/login" class="font-medium text-indigo-600 hover:underline">Log in</a>
        </p>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal('');

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(['/planner']),
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'Something went wrong. Please try again.');
      },
    });
  }
}