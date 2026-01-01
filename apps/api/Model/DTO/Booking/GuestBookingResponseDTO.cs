namespace GiupViecAPI.Model.DTO.Booking
{
    /// <summary>
    /// Response DTO for guest booking creation
    /// Includes booking details and temporary account credentials
    /// </summary>
    public class GuestBookingResponseDTO
    {
        public int BookingId { get; set; }
        public string CustomerEmail { get; set; }
        public string TempPassword { get; set; }
        public string ServiceName { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string StartTime { get; set; }
        public string EndTime { get; set; }
        public string Address { get; set; }
        public decimal TotalPrice { get; set; }
        public string Status { get; set; }
        public string Message { get; set; }
    }
}
