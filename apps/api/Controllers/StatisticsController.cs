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
        public async Task<IActionResult> GetAdminStats()
        {
            try
            {
                var stats = await _service.GetAdminDashboardAsync();
                return Ok(stats);
            }
            catch (Exception ex)
            {
                // Bắt lỗi nếu DB trục trặc
                return StatusCode(500, new { message = "Lỗi server: " + ex.Message });
            }
        }

        [HttpGet("employee")]
        [Authorize(Roles = "Employee")]
        public async Task<IActionResult> GetEmployeeStats()
        {
            try
            {
                var stats = await _service.GetEmployeeDashboardAsync();
                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Lỗi server: " + ex.Message });
            }
        }

        [HttpGet("helper")]
        [Authorize(Roles = "Helper")]
        public async Task<IActionResult> GetHelperStats()
        {
            try
            {
                var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdString))
                {
                    return Unauthorized();
                }

                var userId = int.Parse(userIdString);

                var stats = await _service.GetHelperDashboardAsync(userId);

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