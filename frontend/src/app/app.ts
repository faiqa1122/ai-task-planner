import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastContainerComponent } from './shared/toast-container.component';
import { ConfirmModalComponent } from './shared/confirm-modal.component';

@Component({
  imports: [RouterOutlet, ToastContainerComponent, ConfirmModalComponent],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('frontend');
}
