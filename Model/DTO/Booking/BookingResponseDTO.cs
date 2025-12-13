using GiupViecAPI.Model.Enums;

namespace GiupViecAPI.Model.DTO.Booking
{
    public class BookingResponseDTO
    {
        public int Id { get; set; }
        public string CustomerName { get; set; } // Map từ User
        public string? HelperName { get; set; }  // Map từ User
        public string ServiceName { get; set; }  // Map từ Service

        public string Address { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public TimeSpan WorkShiftStart { get; set; }
        public TimeSpan WorkShiftEnd { get; set; }

        public BookingStatus Status { get; set; }
        public decimal TotalPrice { get; set; }
        public PaymentStatus PaymentStatus { get; set; }
    }
}
