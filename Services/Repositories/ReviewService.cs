using GiupViecAPI.Data;
using GiupViecAPI.Model.Domain;
using GiupViecAPI.Model.DTO.Reviews;
using GiupViecAPI.Model.Enums;
using GiupViecAPI.Services.Interface;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public class ReviewService : IReviewService
{
    private readonly GiupViecDBContext _context;

    public ReviewService(GiupViecDBContext context)
    {
        _context = context;
    }

    public async Task<Review> CreateReviewAsync(CreateReviewDTO input)
    {
        var booking = await _context.Bookings.FindAsync(input.BookingId);
        if (booking == null) throw new Exception("Đơn hàng không tồn tại.");

        if (booking.Status != BookingStatus.Completed)
            throw new Exception("Bạn chỉ có thể đánh giá khi công việc đã hoàn thành.");

        // 2. Kiểm tra xem người review có đúng là khách hàng của booking này không
        // (Giả sử CustomerId là string Int, cần parse hoặc so sánh chuỗi tùy logic Auth của bạn)
        if (booking.CustomerId.ToString() != input.CustomerId)
            throw new Exception("Bạn không có quyền đánh giá đơn hàng này.");
        var newReview = new Review
        {
            BookingId = input.BookingId,
            CustomerId = input.CustomerId,
            HelperId = input.HelperId,
            Rating = input.Rating,
            Comment = input.Comment,
            CreatedAt = DateTime.UtcNow
        };

        _context.Reviews.Add(newReview);
        await _context.SaveChangesAsync();

        var reviews = await _context.Reviews.Where(r => r.HelperId == input.HelperId).ToListAsync();
        if (reviews.Any())
        {
            double average = reviews.Average(r => r.Rating); // Tính trung bình

            // Tìm Profile của Helper để update
            // Lưu ý: HelperId trong bảng Review đang lưu là String, cần convert sang Int để tìm trong HelperProfiles
            if (int.TryParse(input.HelperId, out int helperIdInt))
            {
                var helperProfile = await _context.HelperProfiles.FirstOrDefaultAsync(h => h.UserId == helperIdInt);
                if (helperProfile != null)
                {
                    helperProfile.RatingAverage = (decimal)average;
                    await _context.SaveChangesAsync();
                }
            }
        }

        return newReview;
    }

    public async Task<List<Review>> GetReviewsByHelperAsync(string helperId)
    {
        return await _context.Reviews
            .Where(r => r.HelperId == helperId)
            .OrderByDescending(r => r.CreatedAt) // Mới nhất lên đầu
            .ToListAsync();
    }

    public async Task<Review> GetReviewByBookingIdAsync(int bookingId)
    {
        return await _context.Reviews
            .FirstOrDefaultAsync(r => r.BookingId == bookingId);
    }
}