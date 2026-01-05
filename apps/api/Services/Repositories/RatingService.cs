using AutoMapper;
using GiupViecAPI.Data;
using GiupViecAPI.Model.Domain;
using GiupViecAPI.Model.DTO.Rating;
using GiupViecAPI.Model.Enums;
using GiupViecAPI.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace GiupViecAPI.Services.Repositories
{
    public class RatingService : IRatingService
    {
        private readonly GiupViecDBContext _db;
        private readonly IMapper _mapper;

        public RatingService(GiupViecDBContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        public async Task<RatingResponseDTO> CreateRatingAsync(RatingCreateDTO dto, int customerId)
        {
            // 1. Validate Booking
            var booking = await _db.Bookings
                .Include(b => b.Service)
                .FirstOrDefaultAsync(b => b.Id == dto.BookingId);

            if (booking == null) throw new Exception("Đơn hàng không tồn tại.");
            if (booking.CustomerId != customerId) throw new Exception("Bạn không có quyền đánh giá đơn hàng này.");
            if (booking.Status != BookingStatus.Completed) throw new Exception("Chỉ có thể đánh giá đơn hàng đã hoàn thành.");
            if (booking.IsRated) throw new Exception("Đơn hàng này đã được đánh giá.");
            if (!booking.HelperId.HasValue) throw new Exception("Đơn hàng không có người giúp việc để đánh giá.");

            // 2. Create Rating
            var rating = new Rating
            {
                BookingId = dto.BookingId,
                CustomerId = customerId,
                HelperId = booking.HelperId.Value,
                Score = dto.Score,
                Comment = dto.Comment,
                CreatedAt = DateTime.UtcNow
            };

            // 3. Update Helper Profile
            var helperProfile = await _db.HelperProfiles.FirstOrDefaultAsync(hp => hp.UserId == booking.HelperId.Value);
            if (helperProfile != null)
            {
                // Calculate new average: (OldAvg * OldCount + NewScore) / (OldCount + 1)
                decimal totalScore = (helperProfile.RatingAverage * helperProfile.RatingCount) + dto.Score;
                helperProfile.RatingCount += 1;
                helperProfile.RatingAverage = totalScore / helperProfile.RatingCount;
            }

            // 4. Mark Booking as Rated
            booking.IsRated = true;

            await _db.Ratings.AddAsync(rating);
            await _db.SaveChangesAsync();

            // Load navigation properties for response
            await _db.Entry(rating).Reference(r => r.Customer).LoadAsync();
            await _db.Entry(rating).Reference(r => r.Helper).LoadAsync();

            return _mapper.Map<RatingResponseDTO>(rating);
        }

        public async Task<IEnumerable<RatingResponseDTO>> GetByHelperIdAsync(int helperId)
        {
            var ratings = await _db.Ratings
                .Where(r => r.HelperId == helperId)
                .Include(r => r.Customer)
                .Include(r => r.Helper)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return _mapper.Map<IEnumerable<RatingResponseDTO>>(ratings);
        }

        public async Task<bool> HasCustomerRatedBookingAsync(int customerId, int bookingId)
        {
            return await _db.Ratings.AnyAsync(r => r.CustomerId == customerId && r.BookingId == bookingId);
        }
    }
}
