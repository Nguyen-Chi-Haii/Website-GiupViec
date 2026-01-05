using GiupViecAPI.Data;
using GiupViecAPI.Model.DTO.AdminDashboard;
using GiupViecAPI.Model.Enums;
using GiupViecAPI.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace GiupViecAPI.Services.Repositories
{
    public class StatisticsService : IStatisticsService
    {
        private readonly GiupViecDBContext _db;

        public StatisticsService(GiupViecDBContext db)
        {
            _db = db;
        }

        public async Task<AdminDashboardDTO> GetAdminDashboardAsync()
        {
            // 1. Số liệu đơn hàng
            var totalBookings = await _db.Bookings.CountAsync();
            var pendingBookings = await _db.Bookings.CountAsync(b => b.Status == BookingStatus.Pending); // Khớp với DTO

            // 2. Doanh thu (Chỉ tính đơn đã hoàn thành)
            var totalRevenue = await _db.Bookings
                .Where(b => b.Status == BookingStatus.Completed)
                .SumAsync(b => b.TotalPrice);

            // 3. Số liệu người dùng
            var totalCustomers = await _db.Users.CountAsync(u => u.Role == UserRoles.Customer);
            var totalHelpers = await _db.Users.CountAsync(u => u.Role == UserRoles.Helper);
            var totalUsers = await _db.Users.CountAsync(); // Khớp với DTO

            return new AdminDashboardDTO
            {
                TotalUsers = totalUsers,
                TotalHelpers = totalHelpers,
                TotalCustomers = totalCustomers,
                TotalBookings = totalBookings,
                PendingBookings = pendingBookings, // Đã bổ sung
                TotalRevenue = totalRevenue
            };
        }

        public async Task<AdminDashboardDTO> GetEmployeeDashboardAsync()
        {
            return await GetAdminDashboardAsync();
        }

        public async Task<HelperDashboardDTO> GetHelperDashboardAsync(int userId)
        {
            // (Giữ nguyên logic cũ)
            var profile = await _db.HelperProfiles.FirstOrDefaultAsync(h => h.UserId == userId);

            var totalEarnings = await _db.Bookings
                .Where(b => b.HelperId == userId && b.Status == BookingStatus.Completed)
                .SumAsync(b => b.TotalPrice);

            var completedJobs = await _db.Bookings
                .CountAsync(b => b.HelperId == userId && b.Status == BookingStatus.Completed);

            var upcomingJobs = await _db.Bookings
                .CountAsync(b => b.HelperId == userId &&
                           (b.Status == BookingStatus.Confirmed || b.Status == BookingStatus.Pending));

            return new HelperDashboardDTO
            {
                TotalEarnings = totalEarnings,
                TotalCompletedJobs = completedJobs,
                TotalUpcomingJobs = upcomingJobs,
                AverageRating = profile != null ? profile.RatingAverage : 0
            };
        }
    }
}