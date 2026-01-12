export interface ChatMessage {
    id: number;
    senderId: number;
    receiverId: number;
    content: string;
    sentAt: Date;
    isRead: boolean;
    bookingId?: number;
}

export interface ChatPartner {
    userId: number;
    fullName: string;
    avatar?: string;
    role: string;
    lastMessage?: string;
    lastMessageTime?: Date;
    unreadCount: number;
    isOnline?: boolean; // Optional: for future presence feature
}
