namespace GiupViecAPI.Model.DTO.AdminDashboard
{
    public class HelperDashboardDTO
    {
        public int TotalJobs { get; set; }       // Tổng số việc đã nhận
        public int CompletedJobs { get; set; }   // Số việc đã làm xong
        public decimal TotalIncome { get; set; } // Tổng thu nhập (từ các đơn Completed)
        public decimal Rating { get; set; }      // Điểm đánh giá hiện tại
        public int UpcomingJobs { get; set; }    // Việc sắp tới (Confirmed nhưng chưa làm)
    }
}
