namespace GiupViecAPI.Model.DTO.Booking
{
    /// <summary>
    /// DTO for guest (unauthenticated) booking creation
    /// Creates both user account and booking in one request
    /// </summary>
    public class GuestBookingCreateDTO
    {
        // Customer Info (for new user creation)
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        
        // Booking Info
        public int ServiceId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public TimeSpan WorkShiftStart { get; set; }
        public TimeSpan WorkShiftEnd { get; set; }
        public string? Address { get; set; }
        public int? HelperId { get; set; }
        public double Quantity { get; set; } = 1;

        public string? Notes { get; set; }
        
        // CAPTCHA token from Google reCAPTCHA v3
        public string? CaptchaToken { get; set; }
    }
}
