using GiupViecAPI.Model.Enums;

namespace GiupViecAPI.Model.DTO.Schedule
{
    public class BookingScheduleDTO
    {
        public int Id { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string StartTime { get; set; } // Format: "HH:mm"
        public string EndTime { get; set; }   // Format: "HH:mm"
        public string ServiceName { get; set; }
        public string CustomerName { get; set; }
        public string Address { get; set; }
        public decimal TotalPrice { get; set; }
        public string HelperName { get; set; }
        public string Status { get; set; }

        public bool CustomerConfirmed { get; set; }
        public bool HelperConfirmed { get; set; }
        
        // Keep these for backward compatibility if needed, though we should migrate to HH:mm strings
        public TimeSpan WorkShiftStart { get; set; }
        public TimeSpan WorkShiftEnd { get; set; }
    }
}
