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

        // GET: api/statistics/admin
        [HttpGet("admin")]
        [Authorize(Roles = "Admin")] // Chỉ Admin được xem
        public async Task<IActionResult> GetAdminStats()
        {
            var stats = await _service.GetAdminDashboardAsync();
            return Ok(stats);
        }

        // GET: api/statistics/helper
        [HttpGet("helper")]
        [Authorize(Roles = "Helper")] // Chỉ Helper được xem
        public async Task<IActionResult> GetHelperStats()
        {
            // Lấy ID của user đang đăng nhập từ Token
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdString))
            {
                return Unauthorized();
            }

            var userId = int.Parse(userIdString);
            var stats = await _service.GetHelperDashboardAsync(userId);
            return Ok(stats);
        }
    }
}