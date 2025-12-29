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

        // 1. LẤY DANH SÁCH (Dành cho Admin)
        public async Task<IEnumerable<BookingResponseDTO>> GetAllAsync()
        {
            var list = await _db.Bookings
                .Include(b => b.Service)
                .Include(b => b.Helper)// Lấy thông tin người làm
                .Include(b => b.Customer) // Lấy thông tin khách
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();

            return _mapper.Map<IEnumerable<BookingResponseDTO>>(list);
        }

        // 2. LẤY CHI TIẾT
        public async Task<BookingResponseDTO> GetByIdAsync(int id)
        {
            var booking = await _db.Bookings
                .Include(b => b.Service)
                .Include(b => b.Helper)
                .Include(b => b.Customer)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null) return null;

            return _mapper.Map<BookingResponseDTO>(booking);
        }

        // 3. TẠO ĐƠN MỚI (Tính tiền ngay tại đây thay vì Trigger)
        public async Task<BookingResponseDTO> CreateBookingAsync(BookingCreateDTO dto, int customerId)
        {
            var service = await _db.Services.FindAsync(dto.ServiceId);
            if (service == null) throw new Exception("Dịch vụ không tồn tại");

            var booking = _mapper.Map<Booking>(dto);
            booking.CustomerId = customerId;
            booking.Status = BookingStatus.Pending; // Mặc định chờ

            // --- LOGIC TÍNH TIỀN ---
            // Số ngày = (Kết thúc - Bắt đầu) + 1
            var days = (booking.EndDate - booking.StartDate).Days + 1;
            // Số giờ mỗi ngày
            var hours = booking.WorkShiftEnd - booking.WorkShiftStart;

            double hoursperday = hours.TotalDays;

            if (days <= 0 || hoursperday <= 0) throw new Exception("Thời gian đặt không hợp lệ.");

            // Tổng tiền = Số ngày * Số giờ * Đơn giá
            booking.TotalPrice = days * (decimal)hoursperday * service.Price;
            // -----------------------

            await _db.Bookings.AddAsync(booking);
            await _db.SaveChangesAsync();


            await _db.Entry(booking).Reference(b => b.Service).LoadAsync();
            await _db.Entry(booking).Reference(b => b.Customer).LoadAsync();

            return _mapper.Map<BookingResponseDTO>(booking);
        }

        // 4. CẬP NHẬT ĐƠN (Khách sửa lịch -> Phải tính lại tiền)
        public async Task<BookingResponseDTO> UpdateAsync(int id, BookingUpdateDTO dto)
        {
            var booking = await _db.Bookings.Include(b => b.Service).FirstOrDefaultAsync(b => b.Id == id);
            if (booking == null) return null;

            // Chỉ cho sửa khi đơn chưa hoàn thành/hủy
            if (booking.Status == BookingStatus.Completed || booking.Status == BookingStatus.Cancelled)
            {
                throw new Exception("Không thể sửa đơn hàng đã kết thúc.");
            }

            // Map dữ liệu mới
            booking.Address = dto.Address;
            booking.StartDate = dto.StartDate;
            booking.EndDate = dto.EndDate;
            booking.WorkShiftStart = dto.WorkShiftStart;
            booking.WorkShiftEnd = dto.WorkShiftEnd;
            booking.Notes = dto.Notes;

            // --- TÍNH LẠI TIỀN ---
            var days = (booking.EndDate - booking.StartDate).Days + 1;
            var hours = booking.WorkShiftEnd - booking.WorkShiftStart;
            double hoursperday = hours.TotalDays;
            if (days > 0 && hoursperday > 0)
            {
                booking.TotalPrice = days * (decimal)hoursperday * booking.Service.Price;
            }
            // ---------------------
            await _db.SaveChangesAsync();

            return _mapper.Map<BookingResponseDTO>(booking);
        }

        // 5. GÁN NGƯỜI LÀM (Kiểm tra trùng lịch bằng C#)
        public async Task<BookingResponseDTO> AssignHelperAsync(int id, int helperId)
        {
            var booking = await _db.Bookings.FindAsync(id);
            if (booking == null) return null;

            // Kiểm tra trùng lịch: Tìm xem Helper này có đơn nào khác bị trùng giờ không
            var isConflict = await _db.Bookings.AnyAsync(b =>
                b.HelperId == helperId &&
                b.Id != id &&
                b.Status != BookingStatus.Cancelled &&
                b.Status != BookingStatus.Completed &&
                // Giao nhau về ngày
                b.StartDate <= booking.EndDate && b.EndDate >= booking.StartDate &&
                // Giao nhau về giờ
                b.WorkShiftStart < booking.WorkShiftEnd && b.WorkShiftEnd > booking.WorkShiftStart
            );

            if (isConflict)
            {
                throw new Exception("Người giúp việc đã bận trong khung giờ này.");
            }

            booking.HelperId = helperId;
            booking.Status = BookingStatus.Confirmed; // Đã có người nhận -> Confirmed
            

            await _db.SaveChangesAsync();

            return _mapper.Map<BookingResponseDTO>(booking);
        }

        // 6. CẬP NHẬT TRẠNG THÁI (Duyệt/Hủy/Hoàn thành)
        public async Task<bool> UpdateStatusAsync(int id, BookingStatus status)
        {
            var booking = await _db.Bookings.FindAsync(id);
            if (booking == null) return false;

            booking.Status = status;
            

            await _db.SaveChangesAsync();
            return true;
        }

        // 7. XÁC NHẬN THANH TOÁN
        public async Task<bool> ConfirmPaymentAsync(int id)
        {
            var booking = await _db.Bookings.FindAsync(id);
            if (booking == null) return false;

            booking.PaymentStatus = PaymentStatus.Paid;
            

            await _db.SaveChangesAsync();
            return true;
        }

        // 8. LẤY LỊCH LÀM VIỆC CỦA HELPER
        public async Task<List<BookingScheduleDTO>> GetHelperScheduleAsync(int helperId, DateTime fromDate, DateTime toDate)
        {
            var bookings = await _db.Bookings
                .Include(b => b.Service)
                .Where(b => b.HelperId == helperId
                            && b.Status != BookingStatus.Cancelled
                            && b.StartDate <= toDate && b.EndDate >= fromDate) // Logic check khoảng giao nhau
                .OrderBy(b => b.StartDate)
                .Select(b => new BookingScheduleDTO
                {
                    Id = b.Id,
                    StartDate = b.StartDate,
                    EndDate = b.EndDate,
                    WorkShiftStart = b.WorkShiftStart,
                    WorkShiftEnd = b.WorkShiftEnd,
                    ServiceName = b.Service.Name,
                    Address = b.Address,
                    Status = b.Status
                })
                .ToListAsync();

            return bookings;
        }

        // 9. QUÉT ĐƠN QUÁ HẠN (Thay thế Stored Procedure)
        public async Task CleanExpiredBookingsAsync()
        {
            // Tìm các đơn: Đang chờ (Pending) VÀ Ngày bắt đầu < Hôm nay
            var expiredList = await _db.Bookings
                .Where(b => b.Status == BookingStatus.Pending && b.StartDate < DateTime.Today)
                .ToListAsync();

            if (expiredList.Any())
            {
                foreach (var item in expiredList)
                {
                    item.Status = BookingStatus.Cancelled;
                    item.Notes += " | Hủy tự động do quá hạn.";
                }
                await _db.SaveChangesAsync();
            }
        }
    }
}