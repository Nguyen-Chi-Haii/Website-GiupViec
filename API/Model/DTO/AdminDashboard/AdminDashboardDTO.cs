
namespace GiupViecAPI.Model.DTO.AdminDashboard
{
    public class AdminDashboardDTO
    {
        public int TotalUsers { get; set; }
        public int TotalHelpers { get; set; }
        public int TotalBookings { get; set; }
        public decimal TotalRevenue { get; set; } // Tổng tiền tất cả đơn hàng hoàn thành
        public int PendingBookings { get; set; } // Đơn đang chờ xử lý
    }
}
