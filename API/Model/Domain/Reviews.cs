using System.ComponentModel.DataAnnotations;

namespace GiupViecAPI.Model.Domain
{
    public class Review
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int BookingId { get; set; }

        [Required]
        public int CustomerId { get; set; } // Người đánh giá

        [Required]
        public int HelperId { get; set; }   // Người được đánh giá

        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5")]
        public int Rating { get; set; }

        public string Comment { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
