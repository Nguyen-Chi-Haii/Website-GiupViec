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
            var totalUsers = await _db.Users.CountAsync();
            var totalHelpers = await _db.Users.CountAsync(u => u.Role == UserRoles.Helper);
            var totalBookings = await _db.Bookings.CountAsync();

            // Tính tổng tiền các đơn đã hoàn thành
            var totalRevenue = await _db.Bookings
                .Where(b => b.Status == BookingStatus.Completed)
                .SumAsync(b => b.TotalPrice);

            var pendingBookings = await _db.Bookings
                .CountAsync(b => b.Status == BookingStatus.Pending);

            return new AdminDashboardDTO
            {
                TotalUsers = totalUsers,
                TotalHelpers = totalHelpers,
                TotalBookings = totalBookings,
                TotalRevenue = totalRevenue,
                PendingBookings = pendingBookings
            };
        }

        public async Task<HelperDashboardDTO> GetHelperDashboardAsync(int userId)
        {
            // Lấy thông tin User để check xem có HelperProfile không
            var helperProfile = await _db.HelperProfiles
                .FirstOrDefaultAsync(h => h.UserId == userId);

            decimal currentRating = helperProfile != null ? helperProfile.RatingAverage : 0;

            // Lấy danh sách việc của Helper này
            var myJobs = _db.Bookings.Where(b => b.HelperId == userId);

            var totalJobs = await myJobs.CountAsync();
            var completedJobs = await myJobs.CountAsync(b => b.Status == BookingStatus.Completed);

            // Việc sắp tới: Đã Confirm và thời gian bắt đầu > thời gian hiện tại
            var upcomingJobs = await myJobs
                .CountAsync(b => b.Status == BookingStatus.Confirmed && b.StartDate >= DateTime.UtcNow);

            // Thu nhập: Tổng tiền các đơn đã hoàn thành
            var income = await myJobs
                .Where(b => b.Status == BookingStatus.Completed)
                .SumAsync(b => b.TotalPrice);

            return new HelperDashboardDTO
            {
                TotalJobs = totalJobs,
                CompletedJobs = completedJobs,
                TotalIncome = income,
                Rating = currentRating,
                UpcomingJobs = upcomingJobs
            };
        }
    }
}
