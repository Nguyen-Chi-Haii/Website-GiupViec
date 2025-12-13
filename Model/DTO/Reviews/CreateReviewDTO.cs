using System.ComponentModel.DataAnnotations;

namespace GiupViecAPI.Model.DTO.Reviews
{
    public class CreateReviewDTO
    {
        [Required]
        public int BookingId { get; set; }

        [Required]
        public string CustomerId { get; set; }

        [Required]
        public string HelperId { get; set; }

        [Range(1, 5)]
        public int Rating { get; set; }

        public string Comment { get; set; }
    }
}
