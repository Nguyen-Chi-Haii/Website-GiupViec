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

    public async Task<Review> CreateReviewAsync(CreateReviewDTO dto, int customerId)
    {
        var reviews = await _context.Reviews
           .FromSqlInterpolated($@"EXEC sp_CreateReview 
            @BookingId={dto.BookingId}, 
            @CustomerId={customerId}, 
            @HelperId={dto.HelperId}, 
            @Rating={dto.Rating}, 
            @Comment={dto.Comment}")
           .ToListAsync();

        return reviews.FirstOrDefault();
    }

    public async Task<List<Review>> GetReviewsByHelperAsync(int helperId)
    {
        return await _context.Reviews
            .Where(r => r.HelperId == helperId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<Review> GetReviewByBookingIdAsync(int bookingId)
    {
        return await _context.Reviews
            .FirstOrDefaultAsync(r => r.BookingId == bookingId);
    }
}