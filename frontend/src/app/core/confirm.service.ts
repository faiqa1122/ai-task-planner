import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  danger?: boolean;
}

export interface ConfirmRequest {
  title: string;
  message: string;
  confirmText: string;
  danger: boolean;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly request = signal<ConfirmRequest | null>(null);
  private resolver: ((ok: boolean) => void) | null = null;

  ask(options: ConfirmOptions): Promise<boolean> {
    this.resolver?.(false);

    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
      this.request.set({
        title: options.title,
        message: options.message,
        confirmText: options.confirmText ?? 'Confirm',
        danger: options.danger ?? false,
      });
    });
  }

  answer(ok: boolean) {
    this.request.set(null);
    this.resolver?.(ok);
    this.resolver = null;
  }
}