using GiupViecAPI.Model.DTO.Rating;

namespace GiupViecAPI.Services.Interface
{
    public interface IRatingService
    {
        Task<RatingResponseDTO> CreateRatingAsync(RatingCreateDTO dto, int customerId);
        Task<IEnumerable<RatingResponseDTO>> GetByHelperIdAsync(int helperId);
        Task<bool> HasCustomerRatedBookingAsync(int customerId, int bookingId);
    }
}
