import { Component, inject } from '@angular/core';
import { ThemeService } from '../core/theme.service';

@Component({
  selector: 'app-theme-toggle',
  template: `
    <button
      type="button"
      (click)="theme.toggle()"
      class="btn-ghost inline-flex h-9 w-9 items-center justify-center p-0"
      [attr.aria-label]="theme.isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
      [attr.title]="theme.isDark() ? 'Light mode' : 'Dark mode'"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        @if (theme.isDark()) {
          <circle cx="12" cy="12" r="4" />
          <path
            d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
          />
        } @else {
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        }
      </svg>
    </button>
  `,
})
export class ThemeToggleComponent {
  theme = inject(ThemeService);
}