using System.ComponentModel.DataAnnotations;

namespace GiupViecAPI.Model.DTO.Booking
{
    public class BookingCreateDTO
    {
        [Required]
        public int ServiceId { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Required]
        public TimeSpan WorkShiftStart { get; set; }

        [Required]
        public TimeSpan WorkShiftEnd { get; set; }

        [Required]
        [MaxLength(255)]
        public string? Address { get; set; }

        public int? HelperId { get; set; }
 
        public double Quantity { get; set; } = 1;

        public string? Notes { get; set; }
    }
}