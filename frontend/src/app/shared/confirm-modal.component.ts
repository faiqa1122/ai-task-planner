import { Component, inject } from '@angular/core';
import { ConfirmService } from '../core/confirm.service';

@Component({
  selector: 'app-confirm-modal',
  host: { '(document:keydown.escape)': 'confirm.answer(false)' },
  template: `
    @if (confirm.request(); as r) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        (click)="confirm.answer(false)"
      >
        <div
          class="panel w-full max-w-sm shadow-xl"
          role="dialog"
          aria-modal="true"
          (click)="$event.stopPropagation()"
        >
          <h2 class="text-lg font-semibold">{{ r.title }}</h2>
          <p class="mt-2 text-sm text-muted">{{ r.message }}</p>
          <div class="mt-5 flex justify-end gap-2">
            <button type="button" class="btn-ghost" (click)="confirm.answer(false)">Cancel</button>
            <button type="button" [class]="r.danger ? 'btn-danger' : 'btn'" (click)="confirm.answer(true)">
              {{ r.confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmModalComponent {
  confirm = inject(ConfirmService);
}