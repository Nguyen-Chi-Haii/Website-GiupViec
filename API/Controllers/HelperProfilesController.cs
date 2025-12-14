using GiupViecAPI.Model.DTO.HelperProfile;
using GiupViecAPI.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GiupViecAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HelperProfilesController : ControllerBase
    {
        private readonly IHelperProfileService _service;

        public HelperProfilesController(IHelperProfileService service)
        {
            _service = service;
        }

        // GET: api/helperprofiles/user/5
        // Lấy hồ sơ dựa theo ID của User
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetByUserId(int userId)
        {
            var profile = await _service.GetByUserIdAsync(userId);
            if (profile == null)
            {
                return NotFound(new { message = "User này chưa có hồ sơ giúp việc." });
            }
            return Ok(profile);
        }

        // POST: api/helperprofiles
        // Tạo hồ sơ mới (Chỉ dành cho người có Token)
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] HelperProfileCreateDTO dto)
        {
            try
            {
                var result = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetByUserId), new { userId = dto.UserId }, result);
            }
            catch (Exception ex)
            {
                // Bắt cái lỗi "Không phải Helper" hoặc "Đã có hồ sơ" từ Service ném ra
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: api/helperprofiles/user/5
        // Cập nhật hồ sơ
        [HttpPut("user/{userId}")]
        [Authorize]
        public async Task<IActionResult> Update(int userId, [FromBody] HelperProfileUpdateDTO dto)
        {

            var result = await _service.UpdateAsync(userId, dto);

            if (result == null)
            {
                return NotFound(new { message = "Không tìm thấy hồ sơ để cập nhật." });
            }

            return Ok(result);
        }
    }
}