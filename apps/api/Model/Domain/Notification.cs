using GiupViecAPI.Model.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GiupViecAPI.Model.Domain
{
    public class Notification
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        // Foreign key to User
        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public User? User { get; set; }

        [Required]
        [MaxLength(200)]
        public string? Title { get; set; }

        [Required]
        [MaxLength(1000)]
        public string? Message { get; set; }

        public NotificationType Type { get; set; }

        public bool IsRead { get; set; } = false;

        // Optional: ID của entity liên quan (Booking, Rating, etc.)
        public int? RelatedEntityId { get; set; }

        // Optional: Type của entity (e.g., "Booking", "Rating")
        [MaxLength(50)]
        public string? RelatedEntityType { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
