namespace GiupViecAPI.Model.DTO.Booking
{
    public class BookingResponseDTO
    {
        public int Id { get; set; }

        // --- BỔ SUNG 2 DÒNG NÀY ---
        public int CustomerId { get; set; }
        public int? HelperId { get; set; }
        // --------------------------

        public string CustomerName { get; set; }
        public string? HelperName { get; set; } // Cho phép null (vì mới tạo chưa có Helper)

        public string ServiceName { get; set; }
        public string Address { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public TimeSpan WorkShiftStart { get; set; }
        public TimeSpan WorkShiftEnd { get; set; }
        public decimal TotalPrice { get; set; }

        public string Status { get; set; } // Trả về chuỗi (Pending) thay vì số (0) sẽ đẹp hơn, cần config Mapper
        public string PaymentStatus { get; set; }
    }
}