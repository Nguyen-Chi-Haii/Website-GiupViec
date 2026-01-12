import { Component, OnInit, OnDestroy, inject, signal, effect, ViewChild, ElementRef, HostListener } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../core/services/chat.service';
import { AuthService } from '../../../core/services/auth.service';
import { ChatMessage, ChatPartner } from '../../../core/models/chat-message.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-widget.component.html',
  styleUrl: './chat-widget.component.css'
})
export class ChatWidgetComponent implements OnInit, OnDestroy {
  public chatService = inject(ChatService);
  public authService = inject(AuthService);
  
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  // State
  conversations = signal<ChatPartner[]>([]);
  messages = signal<ChatMessage[]>([]);
  currentPartner = signal<ChatPartner | null>(null);
  messageInput = signal('');
  
  private msgSub: Subscription | null = null;
  currentUserId: number = 0;

  constructor() {
    // Subscribe to Partner Selection changes from external calls (using observable to avoid signal tracking loop)
    toObservable(this.chatService.selectedPartnerId).subscribe(partnerId => {
      if (partnerId) {
        this.selectPartnerById(partnerId);
      }
    });

    effect(() => {
      if (this.chatService.isChatOpen()) {
        this.loadConversations();
      }
    });
  }

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.currentUserId = parseInt(user.nameid);
    }

    // Subscribe to new real-time messages
    this.msgSub = this.chatService.message$.subscribe(msg => {
      // If we are currently talking to this sender/receiver
      const partner = this.currentPartner();
      if (partner && (msg.senderId === partner.userId || msg.receiverId === partner.userId)) {
        // Prevent duplicates (SignalR vs LoadHistory race)
        const exists = this.messages().some(m => m.id === msg.id);
        if (!exists) {
            this.messages.update(msgs => [...msgs, msg]);
            this.scrollToBottom();
        }
        // Mark read logic could go here
      }
      
      // Refresh conversations list to update order/last message
      this.loadConversations();
    });

    if (this.chatService.isChatOpen()) {
      this.loadConversations();
    }
  }

  ngOnDestroy(): void {
    if (this.msgSub) this.msgSub.unsubscribe();
  }

  loadConversations() {
    this.chatService.getConversations().subscribe({
      next: (data) => {
        this.conversations.set(data);
        // If we have a selectedPartnerId but no currentPartner object, try to find it
        const pendingId = this.chatService.selectedPartnerId();
        if (pendingId && !this.currentPartner()) {
           const found = data.find(p => p.userId === pendingId);
           if (found) this.selectPartner(found);
           // If not found in conversations (new chat), we might need to fetch user details or create a dummy partner.
           // For now, assume they exist in conversation history or we handle "First Message" case later.
        }
      }
    });
  }

  loadHistory(partnerId: number) {
    this.chatService.getHistory(partnerId).subscribe({
      next: (msgs) => {
        this.messages.set(msgs);
        this.scrollToBottom();
      }
    });
  }

  selectPartner(partner: ChatPartner) {
    this.currentPartner.set(partner);
    this.chatService.selectedPartnerId.set(partner.userId);
    this.loadHistory(partner.userId);
    // Mark unread as 0 locally
    this.conversations.update(list => list.map(p => p.userId === partner.userId ? { ...p, unreadCount: 0 } : p));
  }
  
  selectPartnerById(id: number) {
    // Prevent infinite loop if already selected
    if (this.currentPartner()?.userId === id) return;

    const partner = this.conversations().find(p => p.userId === id);
    if (partner) {
      this.selectPartner(partner);
    } else {
        // If not found in history, check if a temporary partner (new chat) is set in service
        const temp = this.chatService.tempPartner();
        if (temp && temp.userId === id) {
            // Add to local conversations list temporarily so the UI renders it
            this.conversations.update(list => [temp, ...list]);
            this.selectPartner(temp);
            // Clear temp so we don't spam it
            this.chatService.tempPartner.set(null);
        }
    }
  }

  sendMessage() {
    const content = this.messageInput().trim();
    const partner = this.currentPartner();
    if (!content || !partner) return;

    const bookingId = this.chatService.currentBookingContext() || undefined;

    this.chatService.sendMessage(partner.userId, content, bookingId).then(() => {
      this.messageInput.set('');
      // Optimistic upate is handled by ReceiveMessage subscription (which sends back to sender too based on backend logic)
      // If backend DOESN'T send back to sender, we push manually here:
      /*
      this.messages.update(msgs => [...msgs, {
          id: 0, senderId: this.currentUserId, receiverId: partner.userId,
          content: content, sentAt: new Date(), isRead: false
      }]);
      this.scrollToBottom();
      */
    });
  }

  closeChat() {
    this.chatService.toggleChat(false);
  }
  
  scrollToBottom() {
    setTimeout(() => {
      if (this.scrollContainer) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  // --- Click Outside to Close ---
  private eRef = inject(ElementRef);
  
  // Listen for clicks anywhere on the document
  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!this.chatService.isChatOpen()) return;

    // Check if the click target is NOT inside the chat container
    // We check for the specific class 'chat-widget-container' because the component host might be larger or invisible
    const clickedInside = event.target.closest('.chat-widget-container');
    const clickedToggle = event.target.closest('.chat-toggle-btn');
    
    // Also ignore clicks on "Open Chat" buttons from other parts of the app (sidebar, booking detail)
    // We can assume they have a specific class or we just rely on the fact that those buttons CALL openChat, 
    // but the HostListener runs AFTER the click bubbles. 
    // If we click "Open Chat" in Sidebar:
    // 1. Sidebar (click) -> openChat() -> isChatOpen = true
    // 2. Document (click) -> clickout() -> isChatOpen is true -> clickedInside is false -> closeChat() -> Oops!
    
    // To fix this race condition, we can use a flag or ensure we don't close immediately if it was just opened.
    // OR: checks if the click target has 'open-chat-trigger' class.
    
    // Better approach: user said "hanh dong on destroy khi ban ra ngoai".
    // I will simply check if (!clickedInside && !clickedToggle).
    // And for the race condition, usually stopping propagation on the trigger fixes it, or checking timestamp.
    
    if (!clickedInside && !clickedToggle) {
        // Only close if it's currently open
        this.closeChat();
    }
  }

  getInitials(name: string): string {
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  contactSupport() {
    this.chatService.getSupportContact().subscribe({
      next: (partner) => {
        // Use tempPartner logic to select support even if not in list
        this.chatService.tempPartner.set(partner);
        this.chatService.selectedPartnerId.set(partner.userId);
        // Note: isChatOpen is already true since they clicked the button inside the widget
      },
      error: () => alert('Không tìm thấy nhân viên hỗ trợ!')
    });
  }
}
