using GiupViecAPI.Model.DTO.Booking;
using GiupViecAPI.Model.DTO.Schedule;
using GiupViecAPI.Model.Enums;

namespace GiupViecAPI.Services.Interface
{
    public interface IBookingService
    {
        Task<BookingResponseDTO> CreateBookingAsync(BookingCreateDTO dto, int customerId);
        
        // Admin tạo đơn hàng - có customerId trong DTO
        Task<BookingResponseDTO> AdminCreateBookingAsync(AdminBookingCreateDTO dto);
        
        // Guest tạo đơn hàng - tự động tạo user account
        Task<GuestBookingResponseDTO> GuestCreateBookingAsync(GuestBookingCreateDTO dto);
        
        Task<IEnumerable<BookingResponseDTO>> GetAllAsync();
        Task<IEnumerable<BookingResponseDTO>> GetByCustomerIdAsync(int customerId);
        Task<BookingResponseDTO> GetByIdAsync(int id);

        // Sửa thông tin chung
        Task<BookingResponseDTO> UpdateAsync(int id, BookingUpdateDTO dto);

        // Gán người làm
        Task<BookingResponseDTO> AssignHelperAsync(int id, int helperId);

        // Đổi trạng thái (Dùng chung cho Confirm, Reject, Complete, Cancel)
        Task<bool> UpdateStatusAsync(int id, BookingStatus status);

        Task<bool> ConfirmPaymentAsync(int id);

        Task<bool> ConfirmBookingByCustomerAsync(int bookingId, int customerId);
        Task<bool> ConfirmBookingByHelperAsync(int bookingId, int helperId);

        Task<List<BookingScheduleDTO>> GetHelperScheduleAsync(int helperId, DateTime fromDate, DateTime toDate);
        Task<List<BookingScheduleDTO>> GetAllSchedulesAsync(DateTime fromDate, DateTime toDate);

        Task CleanExpiredBookingsAsync();
    }
}
