import { Component, inject } from '@angular/core';
import { ToastKind, ToastService } from '../core/toast.service';

@Component({
  selector: 'app-toast-container',
  template: `
    <div
      class="pointer-events-none fixed right-4 bottom-4 z-50 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2"
      aria-live="polite"
    >
      @for (t of toast.toasts(); track t.id) {
        <div
          class="pointer-events-auto flex items-start gap-3 rounded-xl border border-line-strong bg-surface p-3 text-sm shadow-lg shadow-black/10"
          role="status"
        >
          <span class="mt-1.5 h-2 w-2 shrink-0 rounded-full" [class]="dot(t.kind)"></span>
          <p class="flex-1 text-ink">{{ t.message }}</p>
          <button
            type="button"
            (click)="toast.dismiss(t.id)"
            class="text-muted hover:text-ink"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  toast = inject(ToastService);

  dot(kind: ToastKind): string {
    switch (kind) {
      case 'success':
        return 'bg-ok';
      case 'error':
        return 'bg-high';
      default:
        return 'bg-accent';
    }
  }
}