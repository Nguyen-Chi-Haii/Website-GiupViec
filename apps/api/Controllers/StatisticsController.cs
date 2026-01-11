using GiupViecAPI.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GiupViecAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Bắt buộc đăng nhập mới xem được thống kê
    public class StatisticsController : ControllerBase
    {
        private readonly IStatisticsService _service;

        public StatisticsController(IStatisticsService service)
        {
            _service = service;
        }

        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAdminStats([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            try
            {
                var stats = await _service.GetAdminDashboardAsync(startDate, endDate);
                return Ok(stats);
            }
            catch (Exception ex)
            {
                // Bắt lỗi nếu DB trục trặc
                return StatusCode(500, new { message = "Lỗi server: " + ex.Message });
            }
        }

        [HttpGet("revenue-chart")]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<IActionResult> GetRevenueChart([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            try
            {
                // Fix: Nếu client không gửi, default lấy năm hiện tại
                if (startDate == default) startDate = new DateTime(DateTime.Now.Year, 1, 1);
                if (endDate == default) endDate = new DateTime(DateTime.Now.Year, 12, 31);
                
                var data = await _service.GetRevenueChartDataAsync(startDate, endDate);
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server: " + ex.Message });
            }
        }

        [HttpGet("employee")]
        [Authorize(Roles = "Employee")]
        public async Task<IActionResult> GetEmployeeStats([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            try
            {
                var stats = await _service.GetEmployeeDashboardAsync(startDate, endDate);
                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server: " + ex.Message });
            }
        }

        [HttpGet("helper")]
        [Authorize(Roles = "Helper")]
        public async Task<IActionResult> GetHelperStats([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            try
            {
                var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdString))
                {
                    return Unauthorized();
                }

                var userId = int.Parse(userIdString);

                var stats = await _service.GetHelperDashboardAsync(userId, startDate, endDate);

                // Nếu chưa có hồ sơ hoặc dữ liệu, trả về mặc định thay vì lỗi
                if (stats == null) return NotFound(new { message = "Không tìm thấy dữ liệu thống kê." });

                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server: " + ex.Message });
            }
        }
    }
}