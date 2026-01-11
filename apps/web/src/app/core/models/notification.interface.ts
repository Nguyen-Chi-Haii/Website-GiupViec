export interface NotificationResponseDTO {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  relatedEntityId?: number;
  relatedEntityType?: string;
  createdAt: string;
}
