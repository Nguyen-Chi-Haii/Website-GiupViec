using GiupViecAPI.Data;
using GiupViecAPI.Model.Enums;
using GiupViecAPI.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace GiupViecAPI.Services
{
    public class JobExpirationService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<JobExpirationService> _logger;
        private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(30); // Check every 30 mins

        public JobExpirationService(IServiceScopeFactory scopeFactory, ILogger<JobExpirationService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Job Expiration Service starting...");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await CheckAndCancelExpiredJobs(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred while checking expired jobs.");
                }

                await Task.Delay(_checkInterval, stoppingToken);
            }
        }

        private async Task CheckAndCancelExpiredJobs(CancellationToken stoppingToken)
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<GiupViecDBContext>();
                var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

                var now = DateTime.Now; // Server local time (assuming VM is in VN or handle UTC)
                // Use DateTime.Today for date comparison if StartDate is just Date
                
                // Find pending bookings where start time has passed
                // Note: StartDate is stored as Date only in DB usually, but C# DateTime has 00:00:00
                // We construct the full start datetime
                
                // Logic: Cancel if Status is 'Pending' AND (Start Time has passed)
                // We need to fetch potential candidates and check in memory because EF Core 
                // might not translate StartDate.Add(WorkShiftStart) effectively in all providers
                
                var expiredJobs = await context.Bookings
                    .Where(b => b.Status == BookingStatus.Pending && !b.IsJobPost) // Wait, strictly Job Posts? Or any Pending Booking? User said "bai dang" (Job Post).
                    // Usually "Pending" without helper means it's available for grab or waiting assignment.
                    // If IsJobPost is true, it might be in "Hiring" (Approved) status?
                    // Let's check BookingStatus again. Pending = 1.
                    // If job is "Approved" for hiring, is Status still Pending? Yes. ApprovalStatus is Approved.
                    
                    .Where(b => b.Status == BookingStatus.Pending)
                    .Where(b => b.StartDate < now.Date) // Definitely expired (yesterday or earlier)
                    .ToListAsync(stoppingToken);

                // Check for Today's jobs that already started
                var todaysJobs = await context.Bookings
                    .Where(b => b.Status == BookingStatus.Pending)
                    .Where(b => b.StartDate == now.Date)
                    .ToListAsync(stoppingToken);

                foreach (var job in todaysJobs)
                {
                    var startDateTime = job.StartDate.Date.Add(job.WorkShiftStart);
                    // Give 30 mins grace period? Or cancel immediately?
                    if (startDateTime < now)
                    {
                        expiredJobs.Add(job);
                    }
                }

                if (expiredJobs.Any())
                {
                    _logger.LogInformation($"Found {expiredJobs.Count} expired pending jobs.");
                    
                    foreach (var job in expiredJobs)
                    {
                        job.Status = BookingStatus.Cancelled;
                        job.RejectionReason = "Đã hủy tự động: Quá hạn thời gian làm việc mà chưa có người nhận.";
                        job.UpdatedAt = DateTime.UtcNow;

                        // Notify Customer
                        await notificationService.CreateNotificationAsync(
                            job.CustomerId,
                            "Đơn hàng hết hạn",
                            $"Đơn hàng #{job.Id} của bạn đã bị hủy do không tìm được người giúp việc trước thời gian làm việc.",
                            NotificationType.BookingCancelled,
                            job.Id,
                            "booking"
                        );
                    }

                    await context.SaveChangesAsync(stoppingToken);
                }
            }
        }
    }
}
