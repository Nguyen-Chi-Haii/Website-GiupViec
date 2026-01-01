using GiupViecAPI.Model.Domain;
using GiupViecAPI.Model.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace GiupViecAPI.Model.Domain
{
    public class Booking
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        // --- CÁC KHÓA NGOẠI (Giữ nguyên) ---
        public int CustomerId { get; set; }
        [ForeignKey("CustomerId")]
        public User Customer { get; set; }

        public int? HelperId { get; set; }
        [ForeignKey("HelperId")]
        public User? Helper { get; set; }

        public int ServiceId { get; set; }
        [ForeignKey("ServiceId")]
        public Service Service { get; set; }

        // --- THAY ĐỔI Ở ĐÂY ---

        // 1. Khoảng thời gian (Ngày)
        [Column(TypeName = "date")] // Chỉ lưu ngày, bỏ phần giờ (VD: 2025-12-01)
        public DateTime StartDate { get; set; }

        [Column(TypeName = "date")]
        public DateTime EndDate { get; set; }

        // 2. Khung giờ làm mỗi ngày (Dùng TimeSpan)
        // Ví dụ: 13:30:00 (1 tiếng rưỡi chiều)
        public TimeSpan WorkShiftStart { get; set; }

        // Ví dụ: 17:30:00 (5 rưỡi chiều)
        public TimeSpan WorkShiftEnd { get; set; }

        // ----------------------

        [Required]
        [MaxLength(255)]
        public string Address { get; set; }

        public string? Notes { get; set; }

        public BookingStatus Status { get; set; } = BookingStatus.Pending;

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalPrice { get; set; }

        public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Unpaid;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}