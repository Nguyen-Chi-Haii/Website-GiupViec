using GiupViecAPI.Model.Enums;

namespace GiupViecAPI.Model.DTO.Schedule
{
    public class BookingScheduleDTO
    {
        public int Id { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string ServiceName { get; set; } // Tên dịch vụ (vd: Dọn nhà)
        public string Address { get; set; }
        public TimeSpan WorkShiftStart { get; set; }
        public TimeSpan WorkShiftEnd { get; set; }// Địa chỉ làm
        public BookingStatus Status { get; set; }
    }
}
