using GiupViecAPI.Model.Domain;
using GiupViecAPI.Model.DTO.Reviews;

namespace GiupViecAPI.Services.Interface
{
    public interface IReviewService
    {
        // Tạo đánh giá mới
        Task<Review> CreateReviewAsync(CreateReviewDTO input);

        // Lấy tất cả đánh giá của một Helper (để hiển thị profile Helper)
        Task<List<Review>> GetReviewsByHelperAsync(int helperId);

        // Lấy đánh giá của một Booking cụ thể
        Task<Review> GetReviewByBookingIdAsync(int bookingId);
    }
}
