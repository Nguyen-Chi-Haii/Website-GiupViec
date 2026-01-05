using System.ComponentModel.DataAnnotations;

namespace GiupViecAPI.Model.DTO.Rating
{
    public class RatingCreateDTO
    {
        [Required]
        public int BookingId { get; set; }

        [Required]
        [Range(1, 5)]
        public int Score { get; set; }

        [MaxLength(1000)]
        public string? Comment { get; set; }
    }

    public class RatingResponseDTO
    {
        public int Id { get; set; }
        public int BookingId { get; set; }
        public int CustomerId { get; set; }
        public string CustomerName { get; set; }
        public int HelperId { get; set; }
        public string HelperName { get; set; }
        public int Score { get; set; }
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
