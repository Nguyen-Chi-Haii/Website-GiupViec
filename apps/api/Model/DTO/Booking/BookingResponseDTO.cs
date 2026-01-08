namespace GiupViecAPI.Model.DTO.Booking
{
    public class BookingResponseDTO
    {
        public int Id { get; set; }

        // Customer & Helper
        public int CustomerId { get; set; }
        public int? HelperId { get; set; }
        public string CustomerName { get; set; }
        public string? HelperName { get; set; }

        // Service
        public int ServiceId { get; set; }
        public string ServiceName { get; set; }
        
        // Location & Time
        public string Address { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string StartTime { get; set; } // Format: "HH:mm"
        public string EndTime { get; set; }   // Format: "HH:mm"
        
        // Price & Status
        public double Quantity { get; set; }
        public string ServiceUnit { get; set; }
        public string? ServiceUnitLabel { get; set; }
        public decimal TotalPrice { get; set; }
        public string Status { get; set; }
        public string PaymentStatus { get; set; }
        public bool IsPaid { get; set; }
        public bool IsRated { get; set; }

        public bool CustomerConfirmed { get; set; }
        public bool HelperConfirmed { get; set; }

        // Metadata
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}