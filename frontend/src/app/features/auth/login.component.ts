import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ThemeToggleComponent } from '../../shared/theme-toggle.component';
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, ThemeToggleComponent],
  template: `
   <div class="relative flex min-h-screen items-center justify-center p-4">
  <div class="absolute top-4 right-4"><app-theme-toggle /></div>
  <div class="panel w-full max-w-md p-8">
    <div class="text-2xl font-bold">Task<span class="text-accent">Planner</span></div>
    <p class="mt-1 text-sm text-muted">Log in to continue</p>

    <form [formGroup]="form" (ngSubmit)="submit()" class="mt-6 space-y-4">
      <div>
        <label class="label">Email</label>
        <input type="email" formControlName="email" class="field" />
        @if (form.controls.email.touched && form.controls.email.invalid) {
          <p class="error-text mt-1">Enter a valid email.</p>
        }
      </div>

      <div>
        <label class="label">Password</label>
        <input type="password" formControlName="password" class="field" />
        @if (form.controls.password.touched && form.controls.password.invalid) {
          <p class="error-text mt-1">Password is required.</p>
        }
      </div>

      @if (error()) {
        <p class="error-box">{{ error() }}</p>
      }

      <button type="submit" [disabled]="loading()" class="btn w-full">
        {{ loading() ? 'Logging in...' : 'Log in' }}
      </button>
    </form>

    <p class="mt-4 text-center text-sm text-muted">
      No account?
      <a routerLink="/register" class="font-semibold text-accent hover:underline">Register</a>
    </p>
  </div>
</div>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal('');

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(['/planner']),
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(err.error?.message ?? 'Something went wrong. Please try again.');
      },
    });
  }
}