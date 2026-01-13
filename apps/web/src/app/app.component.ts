import { Component, OnInit, inject, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PopupComponent } from './shared/popup/popup.component';
import { ChatWidgetComponent } from './shared/components/chat-widget/chat-widget.component';
import { AuthService } from './core/services/auth.service';
import { ChatService } from './core/services/chat.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PopupComponent, ChatWidgetComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  readonly title = 'Giúp Việc Nhà';
  
  private authService = inject(AuthService);
  private chatService = inject(ChatService);

  constructor() {
    // Effect to monitor auth state changes
    effect(() => {
      if (this.authService.isAuthenticated()) {
        this.chatService.startConnection();
      } else {
        this.chatService.stopConnection();
      }
    });
  }

  ngOnInit() {
    // Initial check
    if (this.authService.isAuthenticated()) {
      this.chatService.startConnection();
    }
  }
}
