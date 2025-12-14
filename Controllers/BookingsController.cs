using GiupViecAPI.Model.DTO.Booking;
using GiupViecAPI.Model.Enums;
using GiupViecAPI.Services.Interface;
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

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
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
            var result = await _service.UpdateAsync(id, dto);
            if (result == null) return NotFound();
            return Ok(result);
        }

        // PUT: api/bookings/5/assign-helper
        [HttpPut("{id}/assign-helper")]
        public async Task<IActionResult> AssignHelper(int id, [FromBody] BookingAssignHelperDTO dto)
        {
            try
            {
                var result = await _service.AssignHelperAsync(id, dto.HelperId);
                if (result == null) return NotFound();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: api/bookings/5/confirm
        [HttpPut("{id}/confirm")]
        public async Task<IActionResult> Confirm(int id)
        {
            var success = await _service.UpdateStatusAsync(id, BookingStatus.Confirmed);
            if (!success) return NotFound();
            return Ok(new { message = "Đã xác nhận đơn hàng" });
        }

        // PUT: api/bookings/5/complete
        [HttpPut("{id}/complete")]
        public async Task<IActionResult> Complete(int id)
        {
            var success = await _service.UpdateStatusAsync(id, BookingStatus.Completed);
            if (!success) return NotFound();
            return Ok(new { message = "Đã hoàn thành công việc" });
        }

        // PUT: api/bookings/5/reject
        [HttpPut("{id}/reject")]
        public async Task<IActionResult> Reject(int id)
        {
            var success = await _service.UpdateStatusAsync(id, BookingStatus.Rejected);
            if (!success) return NotFound();
            return Ok(new { message = "Đã từ chối đơn hàng" });
        }

        // PUT: api/bookings/5/cancel
        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> Cancel(int id)
        {
            var success = await _service.UpdateStatusAsync(id, BookingStatus.Cancelled);
            if (!success) return NotFound();
            return Ok(new { message = "Đã hủy đơn hàng" });
        }
        [HttpPut("{id}/payment-confirm")]
        [Authorize(Roles = "Admin,Helper")] // Chỉ Admin hoặc Helper được xác nhận tiền
        public async Task<IActionResult> ConfirmPayment(int id)
        {
            var success = await _service.ConfirmPaymentAsync(id);
            if (!success) return NotFound(new { message = "Không tìm thấy đơn hàng" });

            return Ok(new { message = "Đã xác nhận thanh toán thành công" });
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
    }
}