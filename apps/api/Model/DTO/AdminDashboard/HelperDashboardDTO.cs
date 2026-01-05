namespace GiupViecAPI.Model.DTO.AdminDashboard
{
    public class HelperDashboardDTO
    {
        public int TotalJobs { get; set; }       // Tổng số việc đã nhận
        public decimal TotalEarnings { get; internal set; }
        public int TotalCompletedJobs { get; internal set; }
        public int TotalUpcomingJobs { get; internal set; }
        public decimal AverageRating { get; internal set; }
        public int RatingCount { get; internal set; }
    }
}
