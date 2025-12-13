using AutoMapper;
using GiupViecAPI.Data;
using GiupViecAPI.Model.Domain;
using GiupViecAPI.Model.DTO.Booking;
using GiupViecAPI.Model.Enums;
using GiupViecAPI.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace GiupViecAPI.Services.Repositories
{
    public class BookingService : IBookingService
    {
        private readonly GiupViecDBContext _db;
        private readonly IMapper _mapper;

        public BookingService(GiupViecDBContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        public async Task<IEnumerable<BookingResponseDTO>> GetAllAsync()
        {
            var list = await _db.Bookings
                .Include(b => b.Customer)
                .Include(b => b.Helper)
                .Include(b => b.Service)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();

            return _mapper.Map<IEnumerable<BookingResponseDTO>>(list);
        }

        public async Task<BookingResponseDTO> GetByIdAsync(int id)
        {
            var booking = await _db.Bookings
                .Include(b => b.Customer)
                .Include(b => b.Helper)
                .Include(b => b.Service)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null) return null;

            return _mapper.Map<BookingResponseDTO>(booking);
        }

        public async Task<BookingResponseDTO> UpdateAsync(int id, BookingUpdateDTO dto)
        {
            var booking = await _db.Bookings.Include(b => b.Service).FirstOrDefaultAsync(b => b.Id == id);
            if (booking == null) return null;

            // 1. Cập nhật thông tin cơ bản
            booking.Address = dto.Address;
            booking.StartDate = dto.StartDate;
            booking.EndDate = dto.EndDate;
            booking.WorkShiftStart = dto.WorkShiftStart;
            booking.WorkShiftEnd = dto.WorkShiftEnd;
            booking.Notes = dto.Notes;

            // 2. Tính lại tiền (Do thay đổi thời gian)
            // Công thức: Số ngày * Số giờ mỗi ngày * Giá dịch vụ
            double totalDays = (dto.EndDate - dto.StartDate).TotalDays + 1;
            double hoursPerDay = (dto.WorkShiftEnd - dto.WorkShiftStart).TotalHours;

            if (totalDays > 0 && hoursPerDay > 0)
            {
                booking.TotalPrice = (decimal)(totalDays * hoursPerDay) * booking.Service.Price;
            }

            await _db.SaveChangesAsync();
            return _mapper.Map<BookingResponseDTO>(booking);
        }

        public async Task<BookingResponseDTO> AssignHelperAsync(int id, int helperId)
        {
            var booking = await _db.Bookings.FindAsync(id);
            if (booking == null) return null;

            // Kiểm tra xem helper có tồn tại và đúng Role không
            var helper = await _db.Users.FirstOrDefaultAsync(u => u.Id == helperId && u.Role == UserRoles.Helper);
            if (helper == null) throw new Exception("Helper không tồn tại hoặc không hợp lệ");

            booking.HelperId = helperId;
            booking.Status = BookingStatus.Confirmed; // Gán xong thì Confirm luôn

            await _db.SaveChangesAsync();

            // Load lại thông tin để map sang DTO đầy đủ
            await _db.Entry(booking).Reference(b => b.Helper).LoadAsync();
            await _db.Entry(booking).Reference(b => b.Service).LoadAsync();
            await _db.Entry(booking).Reference(b => b.Customer).LoadAsync();

            return _mapper.Map<BookingResponseDTO>(booking);
        }

        public async Task<bool> UpdateStatusAsync(int id, BookingStatus status)
        {
            var booking = await _db.Bookings.FindAsync(id);
            if (booking == null) return false;

            booking.Status = status;
            await _db.SaveChangesAsync();
            return true;
        }
        public async Task<bool> ConfirmPaymentAsync(int id)
        {
            var booking = await _db.Bookings.FindAsync(id);
            if (booking == null) return false;

            // Chuyển trạng thái sang Paid
            booking.PaymentStatus = PaymentStatus.Paid;

            // Tùy chọn: Nếu thanh toán xong thì có thể auto chuyển trạng thái đơn sang Completed nếu muốn
             booking.Status = BookingStatus.Completed; 

            await _db.SaveChangesAsync();
            return true;
        }
    }
}