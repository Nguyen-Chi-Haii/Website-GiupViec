using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GiupViecAPI.Model.Domain
{
    public class Rating
    {
        [Key]
        public int Id { get; set; }

        public int BookingId { get; set; }
        [ForeignKey("BookingId")]
        public Booking Booking { get; set; }

        public int CustomerId { get; set; }
        [ForeignKey("CustomerId")]
        public User Customer { get; set; }

        public int HelperId { get; set; }
        [ForeignKey("HelperId")]
        public User Helper { get; set; }

        [Range(1, 5)]
        public int Score { get; set; }

        [MaxLength(1000)]
        public string? Comment { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
