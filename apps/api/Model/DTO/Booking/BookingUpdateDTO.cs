using System.ComponentModel.DataAnnotations;

namespace GiupViecAPI.Model.DTO.Booking
{
    public class BookingUpdateDTO
    {
        [Required]
        public string? Address { get; set; }

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        // Định dạng JSON gửi lên ví dụ: "08:00:00"
        public TimeSpan WorkShiftStart { get; set; }
        public TimeSpan WorkShiftEnd { get; set; }

        public string? Notes { get; set; }
    }
}
