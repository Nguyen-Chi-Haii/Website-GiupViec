namespace GiupViecAPI.Model.DTO.Notification
{
    public class NotificationResponseDTO
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? Message { get; set; }
        public string? Type { get; set; } // String representation of enum
        public bool IsRead { get; set; }
        public int? RelatedEntityId { get; set; }
        public string? RelatedEntityType { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
