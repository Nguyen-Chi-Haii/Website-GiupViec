import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { ChatMessage, ChatPartner } from '../models/chat-message.interface';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private hubConnection: HubConnection | null = null;
  private readonly apiUrl = `${environment.apiUrl}/chat`;
  private readonly hubUrl = `${environment.apiUrl.replace('/api', '')}/chathub`; // Assuming API is /api, Hub is root/chathub or similar. Adjust based on Program.cs mapping.
  // Actually based on Program.cs: app.MapHub<ChatHub>("/chathub");
  // If apiUrl is http://localhost:5000/api, then hub is http://localhost:5000/chathub

  private http = inject(HttpClient);
  private authService = inject(AuthService);

  // Signals for state
  public isConnected = signal<boolean>(false);
  public isChatOpen = signal<boolean>(false);
  public selectedPartnerId = signal<number | null>(null);
  public tempPartner = signal<ChatPartner | null>(null); // For starting chat with new users
  public currentBookingContext = signal<number | null>(null);
  public totalUnreadCount = signal<number>(0); // Total unread messages count
  
  // Real-time message subject
  private messageSubject = new Subject<ChatMessage>();
  public message$ = this.messageSubject.asObservable();

  private notificationSubject = new Subject<any>();
  public notification$ = this.notificationSubject.asObservable();

  constructor() {}

  public async startConnection(): Promise<void> {
    const token = this.authService.getToken();
    if (!token || (this.hubConnection?.state === HubConnectionState.Connected)) return;

    // fix hub url logic if needed, assuming simple replace for now or explicit config
    // Let's assume environment.apiUrl is ".../api"
    const rootUrl = environment.apiUrl.endsWith('/api') 
        ? environment.apiUrl.substring(0, environment.apiUrl.length - 4) 
        : environment.apiUrl;
    
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${rootUrl}/chathub`, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('ReceiveMessage', (data: any) => {
      // Map received data to interface if needed, or use directly
      const msg: ChatMessage = {
        id: data.id,
        senderId: data.senderId,
        receiverId: data.receiverId,
        content: data.content,
        sentAt: new Date(data.sentAt),
        isRead: data.isRead,
        bookingId: data.bookingId
      };
      this.messageSubject.next(msg);
      
      // Increment unread count if message is from someone else and not currently viewing their chat
      const currentUser = this.authService.currentUser();
      const currentUserId = currentUser ? parseInt(currentUser.nameid) : 0;
      
      // Only increment if:
      // 1. Message is not from current user (msg.senderId !== currentUserId)
      // 2. AND either chat is closed OR chatting with different person
      if (msg.senderId !== currentUserId) {
        const isViewingThisSender = this.isChatOpen() && this.selectedPartnerId() === msg.senderId;
        if (!isViewingThisSender && !msg.isRead) {
          this.totalUnreadCount.update(count => count + 1);
        }
      }
    });

    this.hubConnection.on('ReceiveNotification', (data: any) => {
      this.notificationSubject.next(data);
    });

    this.hubConnection.onreconnecting(() => this.isConnected.set(false));
    this.hubConnection.onreconnected(() => this.isConnected.set(true));
    this.hubConnection.onclose(() => this.isConnected.set(false));

    try {
      await this.hubConnection.start();
      this.isConnected.set(true);
      console.log('SignalR Connected!');
    } catch (err) {
      console.error('Error while starting connection: ' + err);
      this.isConnected.set(false);
    }
  }

  public async stopConnection(): Promise<void> {
    if (this.hubConnection) {
      await this.hubConnection.stop();
      this.isConnected.set(false);
    }
  }

  public sendMessage(receiverId: number, content: string, bookingId?: number): Promise<void> {
    if (!this.hubConnection) return Promise.reject("No connection");
    return this.hubConnection.invoke('SendMessage', receiverId, content, bookingId);
  }

  public getSupportContact(): Observable<ChatPartner> {
    return this.http.get<ChatPartner>(`${this.apiUrl}/support-contact`);
  }

  // UI Control Methods
  public toggleChat(isOpen: boolean): void {
    this.isChatOpen.set(isOpen);
    if (!isOpen) this.currentBookingContext.set(null); // Clear context on close
    if (isOpen) this.startConnection();
  }

  public openChatWith(partnerId: number, bookingId?: number): void {
    this.isChatOpen.set(true);
    this.selectedPartnerId.set(partnerId);
    if (bookingId) this.currentBookingContext.set(bookingId);
    this.startConnection();
  }

  // API Methods
  public getConversations(): Observable<ChatPartner[]> {
    return this.http.get<ChatPartner[]>(`${this.apiUrl}/conversations`);
  }

  public getHistory(partnerId: number): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/history/${partnerId}`);
  }

  public getUnreadCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/unread-count`);
  }

  public refreshUnreadCount(): void {
    this.getUnreadCount().subscribe({
      next: (count) => this.totalUnreadCount.set(count),
      error: (err) => console.error('Error fetching unread count:', err)
    });
  }
}
