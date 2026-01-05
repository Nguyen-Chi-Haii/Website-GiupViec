using GiupViecAPI.Model.DTO.Booking;
using GiupViecAPI.Model.Enums;
using GiupViecAPI.Services.Interface;
using GiupViecAPI.Services.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GiupViecAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Bảo vệ toàn bộ Controller
    public class BookingsController : ControllerBase
    {
        private readonly IBookingService _service;

        public BookingsController(IBookingService service)
        {
            _service = service;
        }
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] BookingCreateDTO createDto)
        {
            // Lấy CustomerId từ Token của người dùng đang đăng nhập
            // Giả định bạn dùng ClaimTypes.NameIdentifier để lưu UserId
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized("Không tìm thấy thông tin người dùng.");

            int customerId = int.Parse(userIdClaim.Value);

            try
            {
                var result = await _service.CreateBookingAsync(createDto, customerId);

                // Trả về 201 Created
                return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
            }
            catch (Exception ex)
            {
                // QUAN TRỌNG: Hứng lỗi từ Service (VD: Giờ âm, ngày kết thúc nhỏ hơn ngày bắt đầu...)
                // Trả về lỗi 400 kèm message để FE hiển thị alert
                return BadRequest(new { message = ex.Message });
            }
        }

        // Admin tạo đơn hàng - có customerId trong body, không cần lấy từ token
        [HttpPost("admin")]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<IActionResult> AdminCreate([FromBody] AdminBookingCreateDTO dto)
        {
            try
            {
                var result = await _service.AdminCreateBookingAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Guest tạo đơn hàng - không cần đăng nhập, tự động tạo user
        [HttpPost("guest")]
        [AllowAnonymous]
        public async Task<IActionResult> GuestCreate([FromBody] GuestBookingCreateDTO dto)
        {
            try
            {
                var result = await _service.GuestCreateBookingAsync(dto);
                return Ok(result);
            }
            catch (Exception ex)
            {
                // Log full exception details for debugging
                var innerMessage = ex.InnerException?.Message ?? "No inner exception";
                Console.WriteLine($"[GuestBooking Error] {ex.Message}");
                Console.WriteLine($"[GuestBooking InnerException] {innerMessage}");
                return BadRequest(new { message = ex.Message, innerError = innerMessage });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        // GET: api/bookings/my - Lấy đơn hàng của user hiện tại (PHẢI ĐẶT TRƯỚC /{id})
        [HttpGet("my")]
        public async Task<IActionResult> GetMyBookings()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized("Không tìm thấy thông tin người dùng.");

            int customerId = int.Parse(userIdClaim.Value);
            var result = await _service.GetByCustomerIdAsync(customerId);
            return Ok(result);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        // PUT: api/bookings/5 (Sửa thông tin chung)
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateInfo(int id, [FromBody] BookingUpdateDTO dto)
        {
            try
            {
                var result = await _service.UpdateAsync(id, dto);

                if (result == null)
                    return NotFound(new { message = "Không tìm thấy đơn hàng hoặc đơn đã hoàn thành." });

                return Ok(result);
            }
            catch (Exception ex)
            {
                // Hứng lỗi logic (VD: Không được sửa đơn đã hủy...)
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("assign-helper")]
        [Authorize(Roles = "Admin,Employee")] // Ví dụ: Chỉ Admin được gán
        public async Task<IActionResult> AssignHelper([FromBody] BookingAssignHelperDTO dto)
        {
            try
            {
                // Service sẽ check trùng lịch, nếu trùng sẽ throw Exception
                var result = await _service.AssignHelperAsync(dto.BookingId, dto.HelperId);

                if (result == null) return NotFound(new { message = "Không tìm thấy đơn hàng." });

                return Ok(new { message = "Gán người làm thành công!", data = result });
            }
            catch (Exception ex)
            {
                // Hứng lỗi "Người giúp việc đã bận..." từ Service
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: api/bookings/5/status
        // Gom chung các action thay đổi trạng thái vào 1 endpoint
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] BookingStatusUpdateDTO dto)
        {
            // Mapping trạng thái sang message tương ứng
            var statusMessages = new Dictionary<BookingStatus, string>
            {
                { BookingStatus.Confirmed, "Đã xác nhận đơn hàng" },
                { BookingStatus.Completed, "Đã hoàn thành công việc" },
                { BookingStatus.Rejected, "Đã từ chối đơn hàng" },
                { BookingStatus.Cancelled, "Đã hủy đơn hàng" },
                { BookingStatus.Pending, "Đã chuyển về trạng thái chờ xác nhận" }
            };

            var success = await _service.UpdateStatusAsync(id, dto.Status);
            
            if (!success) 
                return NotFound(new { message = "Không tìm thấy đơn hàng" });

            var message = statusMessages.TryGetValue(dto.Status, out var msg) 
                ? msg 
                : "Cập nhật trạng thái thành công";
                
            return Ok(new { message = message, newStatus = dto.Status.ToString() });
        }
        [HttpPut("{id}/payment-confirm")]
        [Authorize(Roles = "Admin,Employee,Helper,Customer")] // Cho phép Customer tự xác nhận thanh toán (giả lập)
        public async Task<IActionResult> ConfirmPayment(int id)
        {
            try
            {
                var success = await _service.ConfirmPaymentAsync(id);
                if (!success) return NotFound(new { message = "Không tìm thấy đơn hàng" });

                return Ok(new { message = "Đã xác nhận thanh toán thành công" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        [HttpGet("my-schedule")]
        [Authorize(Roles = "Helper")] // Chỉ Helper mới gọi được
        public async Task<IActionResult> GetMySchedule([FromQuery] DateTime from, [FromQuery] DateTime to)
        {
            // 1. Lấy ID của Helper đang đăng nhập
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized();
            int helperId = int.Parse(userIdString);

            // 2. Kiểm tra nếu client quên gửi ngày thì mặc định lấy tháng hiện tại
            if (from == default) from = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
            if (to == default) to = from.AddMonths(1).AddDays(-1);

            // 3. Gọi Service
            var schedule = await _service.GetHelperScheduleAsync(helperId, from, to);
            return Ok(schedule);
        }

        [HttpGet("all-schedules")]
        [Authorize(Roles = "Admin,Employee")] 
        public async Task<IActionResult> GetAllSchedules([FromQuery] DateTime from, [FromQuery] DateTime to)
        {
            if (from == default) from = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
            if (to == default) to = from.AddMonths(1).AddDays(-1);

            var schedules = await _service.GetAllSchedulesAsync(from, to);
            return Ok(schedules);
        }
    }
}