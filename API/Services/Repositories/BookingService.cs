using AutoMapper;
using GiupViecAPI.Data;
using GiupViecAPI.Model.Domain;
using GiupViecAPI.Model.DTO.Booking;
using GiupViecAPI.Model.DTO.Schedule;
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
        public async Task<BookingResponseDTO> CreateBookingAsync(BookingCreateDTO dto, int customerId)
        {
            // 1. Chuyển đổi DTO sang Domain Model để chuẩn bị các tham số
            // Lưu ý: TotalPrice sẽ được Trigger TRG_Booking_CalculateTotalPrice tự tính trong DB
            var booking = _mapper.Map<Booking>(dto); //
            booking.CustomerId = customerId; //

            // 2. Thực hiện thêm mới vào DB
            // Chúng ta dùng AddAsync thông thường, Trigger trong DB sẽ tự động can thiệp để tính tiền
            await _db.Bookings.AddAsync(booking); //
            await _db.SaveChangesAsync(); //

            // 3. Reload để lấy các thông tin DB tự sinh (TotalPrice từ Trigger, Id, CreatedAt)
            await _db.Entry(booking).Reference(b => b.Service).LoadAsync(); // Load Service để lấy Price cho Trigger hoặc hiển thị
            await _db.Entry(booking).ReloadAsync(); // Cập nhật TotalPrice mà Trigger vừa tính

            return _mapper.Map<BookingResponseDTO>(booking); //
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

            await _db.SaveChangesAsync(); //

            // Reload lại để lấy TotalPrice mới do Trigger tính
            await _db.Entry(booking).ReloadAsync();

            return _mapper.Map<BookingResponseDTO>(booking);
        }

        public async Task<BookingResponseDTO> AssignHelperAsync(int id, int helperId)
        {
            var booking = await _db.Bookings.FindAsync(id); //
            if (booking == null) return null; //

            // THAY ĐỔI: Sử dụng Function SQL để kiểm tra trùng lịch thay vì viết logic LINQ phức tạp
            var isConflict = await _db.Database
                .SqlQueryRaw<bool>("SELECT dbo.fn_CheckHelperConflict({0}, {1}, {2}, {3}, {4})",
                    helperId, booking.StartDate, booking.EndDate, booking.WorkShiftStart, booking.WorkShiftEnd)
                .SingleAsync();

            if (isConflict) throw new Exception("Helper đã có lịch làm việc khác trùng lặp.");

            // ... phần gán và lưu giữ nguyên
            booking.HelperId = helperId;
            booking.Status = BookingStatus.Confirmed;
            await _db.SaveChangesAsync();

            return _mapper.Map<BookingResponseDTO>(booking);
        }

        public async Task<bool> UpdateStatusAsync(int id, BookingStatus status)
        {
            var booking = await _db.Bookings.FindAsync(id); //
            if (booking == null) return false; //

            // THAY ĐỔI: Thêm kiểm tra logic cơ bản trước khi đẩy xuống DB
            if (booking.Status == BookingStatus.Completed || booking.Status == BookingStatus.Cancelled)
            {
                throw new Exception("Không thể thay đổi trạng thái của đơn hàng đã kết thúc.");
            }

            booking.Status = status; //

            try
            {
                await _db.SaveChangesAsync(); //
            }
            catch (Exception ex)
            {
                // Catch lỗi từ Trigger TRG_Booking_ProtectFinalState nếu có
                throw new Exception(ex.Message);
            }

            return true; //
        }
        public async Task<bool> ConfirmPaymentAsync(int id)
        {
            var booking = await _db.Bookings.FindAsync(id); //
            if (booking == null) return false; //

            // 1. Cập nhật trạng thái thanh toán
            booking.PaymentStatus = PaymentStatus.Paid; //

            await _db.SaveChangesAsync(); //
            return true; //
        }

        public async Task<List<BookingScheduleDTO>> GetHelperScheduleAsync(int helperId, DateTime fromDate, DateTime toDate)
        {
            // Query lấy các đơn hàng của Helper nằm trong khoảng thời gian request
            var bookings = await _db.Bookings
                .Include(b => b.Service) // Join bảng Service để lấy tên
                .Where(b => b.HelperId == helperId
                            && b.Status != BookingStatus.Cancelled // Không lấy đơn đã hủy
                            && b.StartDate >= fromDate
                            && b.StartDate <= toDate)
                .OrderBy(b => b.StartDate)
                .Select(b => new BookingScheduleDTO // Map sang DTO gọn nhẹ
                {
                    Id = b.Id,
                    StartDate = b.StartDate,
                    EndDate = b.EndDate,
                    ServiceName = b.Service.Name,
                    Address = b.Address,
                    Status = b.Status
                })
                .ToListAsync();

            return bookings;
        }
        public async Task CleanExpiredBookingsAsync()
        {
            await _db.Database.ExecuteSqlRawAsync("EXEC sp_CancelExpiredBookings");
        }
    }
}