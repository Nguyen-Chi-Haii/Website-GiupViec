using GiupViecAPI.Model.DTO.AdminDashboard;

namespace GiupViecAPI.Services.Interface
{
    public interface IStatisticsService
    {
        // Thống kê cho Admin
        Task<AdminDashboardDTO> GetAdminDashboardAsync(DateTime? startDate = null, DateTime? endDate = null);

        // Thống kê cho Employee (tương tự Admin)
        Task<AdminDashboardDTO> GetEmployeeDashboardAsync(DateTime? startDate = null, DateTime? endDate = null);

        // Thống kê cho Helper (dựa vào ID người dùng đang đăng nhập)
        Task<HelperDashboardDTO> GetHelperDashboardAsync(int userId, DateTime? startDate = null, DateTime? endDate = null);
        
        // Dữ liệu biểu đồ doanh thu
        Task<object> GetRevenueChartDataAsync(DateTime startDate, DateTime endDate);
    }
}
