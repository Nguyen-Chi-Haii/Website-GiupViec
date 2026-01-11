namespace GiupViecAPI.Model.Enums
{
    public enum NotificationType
    {
        BookingCreated = 1,         // Khách hàng tạo đơn mới
        BookingApproved = 2,        // Admin phê duyệt đơn
        BookingRejected = 3,        // Admin từ chối đơn
        BookingAccepted = 4,        // Helper nhận việc
        BookingConfirmed = 5,       // Booking được xác nhận (bởi cả 2 bên)
        BookingCompleted = 6,       // Công việc hoàn thành
        BookingCancelled = 7,       // Đơn bị hủy
        PaymentConfirmed = 8,       // Thanh toán được xác nhận
        RatingReceived = 9          // Nhận được đánh giá mới
    }
}
