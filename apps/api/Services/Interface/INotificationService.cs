using GiupViecAPI.Model.DTO.Notification;
using GiupViecAPI.Model.Enums;

namespace GiupViecAPI.Services.Interface
{
    public interface INotificationService
    {
        Task CreateNotificationAsync(int userId, string title, string message, NotificationType type, int? relatedEntityId = null, string? relatedEntityType = null);
        Task<List<NotificationResponseDTO>> GetUserNotificationsAsync(int userId, int skip = 0, int take = 20);
        Task<int> GetUnreadCountAsync(int userId);
        Task MarkAsReadAsync(int notificationId, int userId);
        Task MarkAllAsReadAsync(int userId);
    }
}
