using GiupViecAPI.Data;
using GiupViecAPI.Model.DTO.AdminDashboard;
using GiupViecAPI.Model.DTO.Schedule;
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

        public async Task<AdminDashboardDTO> GetAdminDashboardAsync(DateTime? startDate = null, DateTime? endDate = null)
        {
            // Query cơ bản
            var bookingsQuery = _db.Bookings.AsQueryable();
            var revenueQuery = _db.Bookings.Where(b => b.Status == BookingStatus.Completed);
            
            // Apply Date Filter
            if (startDate.HasValue)
            {
                bookingsQuery = bookingsQuery.Where(b => b.CreatedAt >= startDate.Value);
                revenueQuery = revenueQuery.Where(b => b.CreatedAt >= startDate.Value); // Doanh thu tính theo ngày tạo đơn hay ngày hoàn thành? Tạm tính ngày CreatedAt cho thống nhất
            }
            if (endDate.HasValue)
            {
                bookingsQuery = bookingsQuery.Where(b => b.CreatedAt <= endDate.Value);
                revenueQuery = revenueQuery.Where(b => b.CreatedAt <= endDate.Value);
            }

            // 1. Số liệu đơn hàng
            var totalBookings = await bookingsQuery.CountAsync();
            var pendingBookings = await bookingsQuery.CountAsync(b => b.Status == BookingStatus.Pending);

            // 2. Doanh thu
            var totalRevenue = await revenueQuery.SumAsync(b => b.TotalPrice);

            // 3. Số liệu người dùng (Không bị ảnh hưởng bởi date filter, hoặc tùy users muốn xem "New users in period")
            // Ở đây giữ nguyên total users hệ thống
            var totalCustomers = await _db.Users.CountAsync(u => u.Role == UserRoles.Customer);
            var totalHelpers = await _db.Users.CountAsync(u => u.Role == UserRoles.Helper);
            var totalUsers = await _db.Users.CountAsync();

            return new AdminDashboardDTO
            {
                TotalUsers = totalUsers,
                TotalHelpers = totalHelpers, // New Helpers
                TotalCustomers = totalCustomers, // New Customers
                TotalBookings = totalBookings,
                PendingBookings = pendingBookings,
                TotalRevenue = totalRevenue
            };
        }

        public async Task<AdminDashboardDTO> GetEmployeeDashboardAsync(DateTime? startDate = null, DateTime? endDate = null)
        {
            return await GetAdminDashboardAsync(startDate, endDate);
        }

        public async Task<HelperDashboardDTO> GetHelperDashboardAsync(int userId, DateTime? startDate = null, DateTime? endDate = null)
        {
            var bookingsQuery = _db.Bookings.Where(b => b.HelperId == userId);

            // Filter logic
            if (startDate.HasValue) bookingsQuery = bookingsQuery.Where(b => b.CreatedAt >= startDate.Value);
            if (endDate.HasValue) bookingsQuery = bookingsQuery.Where(b => b.CreatedAt <= endDate.Value);

            var profile = await _db.HelperProfiles.FirstOrDefaultAsync(h => h.UserId == userId);

            var totalEarnings = await bookingsQuery
                .Where(b => b.Status == BookingStatus.Completed)
                .SumAsync(b => b.TotalPrice);

            var completedJobs = await bookingsQuery
                .CountAsync(b => b.Status == BookingStatus.Completed);

            // Upcoming jobs: bookings in future, not cancelled/rejected/completed. Not strictly affected by "Created Date" filter usually, 
            // but if looking at "Jobs created in this month", then yes.
            // Let's keep upcoming jobs as "Currently upcoming" regardless of filter, OR filter them. 
            // Usually dashboard shows "Overview in period".
            // Let's filter them too.
            var upcomingJobs = await bookingsQuery
                .CountAsync(b => 
                           (b.Status == BookingStatus.Confirmed || b.Status == BookingStatus.Pending));

            // Recent jobs: Top 5 of the period
            var recentCompletedJobs = await bookingsQuery
                .Include(b => b.Service)
                .Include(b => b.Customer)
                .Where(b => b.Status == BookingStatus.Completed)
                .OrderByDescending(b => b.UpdatedAt)
                .Take(5)
                .Select(b => new BookingScheduleDTO
                {
                    Id = b.Id,
                    StartDate = b.StartDate,
                    EndDate = b.EndDate,
                    StartTime = b.WorkShiftStart.ToString(@"hh\:mm"),
                    EndTime = b.WorkShiftEnd.ToString(@"hh\:mm"),
                    ServiceName = b.Service != null ? b.Service.Name : "Dịch vụ đã xóa",
                    CustomerName = b.Customer != null ? b.Customer.FullName : "Khách vãng lai",
                    Address = b.Address,
                    TotalPrice = b.TotalPrice,
                    Status = b.Status.ToString(),
                    CustomerConfirmed = b.CustomerConfirmed,
                    HelperConfirmed = b.HelperConfirmed
                })
                .ToListAsync();

            return new HelperDashboardDTO
            {
                TotalEarnings = totalEarnings,
                TotalCompletedJobs = completedJobs,
                TotalUpcomingJobs = upcomingJobs,
                AverageRating = profile != null ? profile.RatingAverage : 0,
                RatingCount = profile != null ? profile.RatingCount : 0,
                RecentCompletedJobs = recentCompletedJobs
            };
        }

        public async Task<object> GetRevenueChartDataAsync(DateTime startDate, DateTime endDate)
        {
            // Group by Month/Year
            var data = await _db.Bookings
                .Where(b => b.Status == BookingStatus.Completed && 
                            b.CreatedAt >= startDate && b.CreatedAt <= endDate)
                .GroupBy(b => new { b.CreatedAt.Year, b.CreatedAt.Month })
                .Select(g => new 
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    Revenue = g.Sum(b => b.TotalPrice),
                    Count = g.Count()
                })
                .OrderBy(x => x.Year).ThenBy(x => x.Month)
                .ToListAsync();

            // Format data for ChartJS (Labels and Values)
            var labels = data.Select(x => $"T{x.Month}/{x.Year}").ToList();
            var revenues = data.Select(x => x.Revenue).ToList();

            return new { labels, revenues };
        }
    }
}