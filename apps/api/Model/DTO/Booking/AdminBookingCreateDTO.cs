using System.ComponentModel.DataAnnotations;

namespace GiupViecAPI.Model.DTO.Booking
{
    /// <summary>
    /// DTO cho Admin tạo đơn hàng - bao gồm CustomerId thay vì lấy từ token
    /// </summary>
    public class AdminBookingCreateDTO
    {
        [Required(ErrorMessage = "Vui lòng chọn khách hàng")]
        public int CustomerId { get; set; }

        [Required(ErrorMessage = "Vui lòng chọn dịch vụ")]
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
        public string Address { get; set; }

        public double Quantity { get; set; } = 1;

        public string? Notes { get; set; }

        // Optional: Admin có thể gán Helper ngay khi tạo
        public int? HelperId { get; set; }
    }
}
