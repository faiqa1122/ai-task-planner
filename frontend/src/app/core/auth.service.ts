import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';


type AuthResponse = { token: string; [key: string]: unknown };
type LoginRequest = object;
type RegisterRequest = object;

const STORAGE_KEY = 'taskplanner_auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly _user = signal<AuthResponse | null>(this.load());
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);

  get token(): string | null {
    return this._user()?.token ?? null;
  }

  register(body: RegisterRequest) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/register`, body)
      .pipe(tap((res) => this.save(res)));
  }

  login(body: LoginRequest) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, body)
      .pipe(tap((res) => this.save(res)));
  }

  logout() {
    this._user.set(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    this.router.navigate(['/login']);
  }

  private save(res: AuthResponse) {
    this._user.set(res);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(res));
    } catch {}
  }

  private load(): AuthResponse | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AuthResponse) : null;
    } catch {
      return null;
    }
  }
}