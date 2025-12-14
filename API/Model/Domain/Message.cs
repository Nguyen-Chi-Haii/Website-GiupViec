using System.ComponentModel.DataAnnotations;

namespace GiupViecAPI.Model.Domain
{
    public class Message
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int BookingId { get; set; } // Dùng để nhóm chat theo đơn hàng/booking

        [Required]
        public string SenderId { get; set; }

        [Required]
        public string ReceiverId { get; set; }

        [Required]
        public string Content { get; set; }

        public DateTime SentAt { get; set; } = DateTime.UtcNow;
    }
}
