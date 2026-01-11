using GiupViecAPI.Model.DTO.Booking;
using GiupViecAPI.Model.DTO.Shared;
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
        
        Task<PagedResult<BookingResponseDTO>> GetAllAsync(BookingFilterDTO filter);
        Task<PagedResult<BookingResponseDTO>> GetByCustomerIdAsync(int customerId, BookingFilterDTO filter);
        Task<BookingResponseDTO?> GetByIdAsync(int id);

        // --- NEW FEATURES ---
        // Lấy danh sách công việc phù hợp cho Helper (Auto-filter by Helper Location)
        Task<PagedResult<BookingResponseDTO>> GetAvailableJobsAsync(int helperId, AvailableJobFilterDTO filter);
        
        // Helper tự nhận việc
        Task<BookingResponseDTO?> AcceptJobAsync(int bookingId, int helperId);

        // Lấy danh sách công việc đã nhận của Helper
        Task<PagedResult<BookingResponseDTO>> GetHelperJobsAsync(int helperId, BookingFilterDTO filter);

        // Lấy danh sách bài đăng chờ duyệt
        Task<PagedResult<BookingResponseDTO>> GetPendingApprovalsAsync(BookingFilterDTO filter);

        // Admin phê duyệt / từ chối
        Task<BookingResponseDTO?> ApproveBookingAsync(int bookingId, int approvedBy, string? note);
        Task<BookingResponseDTO?> RejectBookingAsync(int bookingId, int rejectedBy, string reason);
        // --------------------

        // Sửa thông tin chung
        Task<BookingResponseDTO?> UpdateAsync(int id, BookingUpdateDTO dto);

        // Gán người làm
        Task<BookingResponseDTO?> AssignHelperAsync(int id, int helperId);

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
