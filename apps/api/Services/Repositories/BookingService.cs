using AutoMapper;
using GiupViecAPI.Data;
using GiupViecAPI.Model.Domain;
using GiupViecAPI.Model.DTO.Booking;
using GiupViecAPI.Model.DTO.Schedule;
using GiupViecAPI.Model.Enums;
using GiupViecAPI.Services.Interface;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace GiupViecAPI.Services.Repositories
{
    public class BookingService : IBookingService
    {
        private readonly GiupViecDBContext _db;
        private readonly IMapper _mapper;
        private readonly UserManager<User> _userManager;
        private readonly IRecaptchaService _recaptchaService;

        public BookingService(
            GiupViecDBContext db, 
            IMapper mapper,
            UserManager<User> userManager,
            IRecaptchaService recaptchaService)
        {
            _db = db;
            _mapper = mapper;
            _userManager = userManager;
            _recaptchaService = recaptchaService;
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

        // 2.5 LẤY DANH SÁCH THEO CUSTOMER ID
        public async Task<IEnumerable<BookingResponseDTO>> GetByCustomerIdAsync(int customerId)
        {
            var list = await _db.Bookings
                .Where(b => b.CustomerId == customerId)
                .Include(b => b.Service)
                .Include(b => b.Helper)
                .Include(b => b.Customer)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();

            return _mapper.Map<IEnumerable<BookingResponseDTO>>(list);
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
            double hoursperday = hours.TotalHours;

            if (days <= 0 || hoursperday <= 0) throw new Exception("Thời gian đặt không hợp lệ.");

            // Tổng tiền = Số ngày * Số giờ * Đơn giá
            booking.TotalPrice = days * (decimal)hoursperday * service.Price;
            // -----------------------

            // Nếu user chọn helper sẵn từ frontend
            if (dto.HelperId.HasValue && dto.HelperId.Value > 0)
            {
                // Kiểm tra trùng lịch
                var isConflict = await _db.Bookings.AnyAsync(b =>
                    b.HelperId == dto.HelperId.Value &&
                    b.Status != BookingStatus.Cancelled &&
                    b.Status != BookingStatus.Completed &&
                    b.StartDate <= booking.EndDate && b.EndDate >= booking.StartDate &&
                    b.WorkShiftStart < booking.WorkShiftEnd && b.WorkShiftEnd > booking.WorkShiftStart
                );

                if (isConflict)
                {
                    throw new Exception("Người giúp việc đã bận trong khung giờ này.");
                }

                booking.HelperId = dto.HelperId.Value;
                // Bỏ dòng chuyển sang Confirmed, giữ nguyên Pending
            }

            await _db.Bookings.AddAsync(booking);
            await _db.SaveChangesAsync();


            await _db.Entry(booking).Reference(b => b.Service).LoadAsync();
            await _db.Entry(booking).Reference(b => b.Customer).LoadAsync();
            if (booking.HelperId.HasValue)
            {
                await _db.Entry(booking).Reference(b => b.Helper).LoadAsync();
            }

            return _mapper.Map<BookingResponseDTO>(booking);
        }

        // 3.5 ADMIN TẠO ĐƠN (Có customerId trong DTO, có thể gán helper ngay)
        public async Task<BookingResponseDTO> AdminCreateBookingAsync(AdminBookingCreateDTO dto)
        {
            var service = await _db.Services.FindAsync(dto.ServiceId);
            if (service == null) throw new Exception("Dịch vụ không tồn tại");

            var customer = await _db.Users.FindAsync(dto.CustomerId);
            if (customer == null) throw new Exception("Khách hàng không tồn tại");

            var booking = new Booking
            {
                CustomerId = dto.CustomerId,
                ServiceId = dto.ServiceId,
                Address = dto.Address,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                WorkShiftStart = dto.WorkShiftStart,
                WorkShiftEnd = dto.WorkShiftEnd,
                Notes = dto.Notes,
                Status = BookingStatus.Pending
            };

            // --- LOGIC TÍNH TIỀN ---
            var days = (booking.EndDate - booking.StartDate).Days + 1;
            var hours = booking.WorkShiftEnd - booking.WorkShiftStart;
            double hoursperday = hours.TotalHours;

            if (days <= 0 || hoursperday <= 0) throw new Exception("Thời gian đặt không hợp lệ.");

            booking.TotalPrice = days * (decimal)hoursperday * service.Price;

            // Nếu admin gán helper ngay
            if (dto.HelperId.HasValue && dto.HelperId.Value > 0)
            {
                // Kiểm tra trùng lịch
                var isConflict = await _db.Bookings.AnyAsync(b =>
                    b.HelperId == dto.HelperId.Value &&
                    b.Status != BookingStatus.Cancelled &&
                    b.Status != BookingStatus.Completed &&
                    b.StartDate <= booking.EndDate && b.EndDate >= booking.StartDate &&
                    b.WorkShiftStart < booking.WorkShiftEnd && b.WorkShiftEnd > booking.WorkShiftStart
                );

                if (isConflict)
                {
                    throw new Exception("Người giúp việc đã bận trong khung giờ này.");
                }

                booking.HelperId = dto.HelperId.Value;
                booking.Status = BookingStatus.Confirmed; // Đã gán -> Xác nhận luôn
            }

            await _db.Bookings.AddAsync(booking);
            await _db.SaveChangesAsync();

            await _db.Entry(booking).Reference(b => b.Service).LoadAsync();
            await _db.Entry(booking).Reference(b => b.Customer).LoadAsync();
            if (booking.HelperId.HasValue)
            {
                await _db.Entry(booking).Reference(b => b.Helper).LoadAsync();
            }

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
            double hoursperday = hours.TotalHours;
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
                .Include(b => b.Customer)
                .Where(b => b.HelperId == helperId
                            && b.Status != BookingStatus.Cancelled
                            && b.StartDate <= toDate && b.EndDate >= fromDate)
                .OrderBy(b => b.StartDate)
                .Select(b => new BookingScheduleDTO
                {
                    Id = b.Id,
                    StartDate = b.StartDate,
                    EndDate = b.EndDate,
                    StartTime = b.WorkShiftStart.ToString(@"hh\:mm"),
                    EndTime = b.WorkShiftEnd.ToString(@"hh\:mm"),
                    WorkShiftStart = b.WorkShiftStart,
                    WorkShiftEnd = b.WorkShiftEnd,
                    ServiceName = b.Service.Name,
                    CustomerName = b.Customer != null ? b.Customer.FullName : "Khách vãng lai",
                    Address = b.Address,
                    TotalPrice = b.TotalPrice,
                    HelperName = b.Helper != null ? b.Helper.FullName : "Chưa gán",
                    Status = b.Status.ToString()
                })
                .ToListAsync();

            return bookings;
        }

        public async Task<List<BookingScheduleDTO>> GetAllSchedulesAsync(DateTime fromDate, DateTime toDate)
        {
            return await _db.Bookings
                .Include(b => b.Service)
                .Include(b => b.Helper)
                .Include(b => b.Customer) // Added to include customer information
                .Where(b => b.Status != BookingStatus.Cancelled
                            && b.Status != BookingStatus.Rejected
                            && b.StartDate <= toDate && b.EndDate >= fromDate)
                .OrderBy(b => b.StartDate)
                .Select(b => new BookingScheduleDTO
                {
                    Id = b.Id,
                    StartDate = b.StartDate,
                    EndDate = b.EndDate,
                    StartTime = b.WorkShiftStart.ToString(@"hh\:mm"),
                    EndTime = b.WorkShiftEnd.ToString(@"hh\:mm"),
                    WorkShiftStart = b.WorkShiftStart,
                    WorkShiftEnd = b.WorkShiftEnd,
                    ServiceName = b.Service.Name,
                    CustomerName = b.Customer != null ? b.Customer.FullName : "Khách vãng lai",
                    Address = b.Address,
                    TotalPrice = b.TotalPrice,
                    HelperName = b.Helper != null ? b.Helper.FullName : "Chưa gán",
                    Status = b.Status.ToString()
                }).ToListAsync();
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

        // 10. TẠO ĐƠN CHO KHÁCH CHƯA ĐĂNG NHẬP (Guest Booking)
        public async Task<GuestBookingResponseDTO> GuestCreateBookingAsync(GuestBookingCreateDTO dto)
        {
            // 1. Verify CAPTCHA
            var captchaValid = await _recaptchaService.VerifyAsync(dto.CaptchaToken);
            if (!captchaValid)
            {
                throw new Exception("Xác thực CAPTCHA thất bại. Vui lòng thử lại.");
            }

            // 2. Check if email already exists
            var existingUser = await _userManager.FindByEmailAsync(dto.Email);
            if (existingUser != null)
            {
                throw new Exception("Email đã được sử dụng. Vui lòng đăng nhập hoặc sử dụng email khác.");
            }

            // 3. Validate service exists
            var service = await _db.Services.FindAsync(dto.ServiceId);
            if (service == null)
            {
                throw new Exception("Dịch vụ không tồn tại.");
            }

            // 4. Generate temporary password
            var tempPassword = GenerateTemporaryPassword();

            // 5. Create new user account
            var newUser = new User
            {
                UserName = dto.Email,
                Email = dto.Email,
                FullName = dto.FullName,
                PhoneNumber = dto.Phone,
                Address = dto.Address, // Use booking address as user's default address
                Avatar = "", // Default empty avatar for guest users
                Role = UserRoles.Customer,
                Status = UserStatus.Active,
                MustChangePassword = true, // Force password change on first login
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            var createResult = await _userManager.CreateAsync(newUser, tempPassword);
            if (!createResult.Succeeded)
            {
                var errors = string.Join(", ", createResult.Errors.Select(e => e.Description));
                throw new Exception($"Không thể tạo tài khoản: {errors}");
            }

            // 6. Calculate total price
            int totalDays = (dto.EndDate - dto.StartDate).Days + 1;
            decimal hoursPerDay = (decimal)(dto.WorkShiftEnd - dto.WorkShiftStart).TotalHours;
            decimal totalPrice = totalDays * hoursPerDay * service.Price;

            // 7. Create booking
            var booking = new Booking
            {
                CustomerId = newUser.Id,
                ServiceId = dto.ServiceId,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                WorkShiftStart = dto.WorkShiftStart,
                WorkShiftEnd = dto.WorkShiftEnd,
                Address = dto.Address,
                Notes = dto.Notes,
                TotalPrice = totalPrice,
                Status = BookingStatus.Pending,
                PaymentStatus = PaymentStatus.Unpaid,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Nếu khách chọn helper sẵn từ frontend
            if (dto.HelperId.HasValue && dto.HelperId.Value > 0)
            {
                // Kiểm tra trùng lịch
                var isConflict = await _db.Bookings.AnyAsync(b =>
                    b.HelperId == dto.HelperId.Value &&
                    b.Status != BookingStatus.Cancelled &&
                    b.Status != BookingStatus.Completed &&
                    b.StartDate <= booking.EndDate && b.EndDate >= booking.StartDate &&
                    b.WorkShiftStart < booking.WorkShiftEnd && b.WorkShiftEnd > booking.WorkShiftStart
                );

                if (!isConflict)
                {
                    booking.HelperId = dto.HelperId.Value;
                    // Bỏ dòng chuyển sang Confirmed, giữ nguyên Pending
                }
            }

            await _db.Bookings.AddAsync(booking);
            await _db.SaveChangesAsync();

            // 8. Return response with temp password
            var response = new GuestBookingResponseDTO
            {
                BookingId = booking.Id,
                CustomerEmail = dto.Email,
                TempPassword = tempPassword,
                ServiceName = service.Name,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                StartTime = dto.WorkShiftStart.ToString(@"hh\:mm"),
                EndTime = dto.WorkShiftEnd.ToString(@"hh\:mm"),
                Address = dto.Address,
                TotalPrice = totalPrice,
                HelperId = booking.HelperId,
                Status = booking.Status.ToString(),
                Message = $"Đặt lịch thành công! Mã đơn hàng: #{booking.Id}. " +
                          $"Tài khoản đã được tạo với email: {dto.Email}. " +
                          $"Vui lòng đăng nhập và đổi mật khẩu ngay."
            };

            if (booking.HelperId.HasValue)
            {
                await _db.Entry(booking).Reference(b => b.Helper).LoadAsync();
                response.HelperName = booking.Helper.FullName;
            }

            return response;
        }

        private string GenerateTemporaryPassword()
        {
            // Generate a secure random password
            const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
            const string specialChars = "@#$%&*!";
            var random = new Random();
            
            var password = new char[10];
            for (int i = 0; i < 8; i++)
            {
                password[i] = chars[random.Next(chars.Length)];
            }
            // Add at least one special char and one number
            password[8] = specialChars[random.Next(specialChars.Length)];
            password[9] = "23456789"[random.Next(8)];
            
            return new string(password);
        }
    }
}