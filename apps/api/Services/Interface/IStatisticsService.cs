using GiupViecAPI.Model.DTO.AdminDashboard;

namespace GiupViecAPI.Services.Interface
{
    public interface IStatisticsService
    {
        // Thống kê cho Admin
        Task<AdminDashboardDTO> GetAdminDashboardAsync();

        // Thống kê cho Employee (tương tự Admin)
        Task<AdminDashboardDTO> GetEmployeeDashboardAsync();

        // Thống kê cho Helper (dựa vào ID người dùng đang đăng nhập)
        Task<HelperDashboardDTO> GetHelperDashboardAsync(int userId);
    }
}
