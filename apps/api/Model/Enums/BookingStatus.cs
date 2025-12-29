namespace GiupViecAPI.Model.Enums
{
    public enum BookingStatus
    {
        Pending = 1,    // Chờ xác nhận (khi khách vừa đặt)
        Confirmed = 2,  // Đã có người nhận việc / Admin xác nhận
        Rejected = 3,   // Bị từ chối (bởi Helper hoặc Admin)
        Completed = 4,  // Hoàn thành công việc
        Cancelled = 5   // Khách hủy
    }
}
