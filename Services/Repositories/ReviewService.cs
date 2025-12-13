using GiupViecAPI.Data;
using GiupViecAPI.Model.Domain;
using GiupViecAPI.Model.DTO.Reviews;
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