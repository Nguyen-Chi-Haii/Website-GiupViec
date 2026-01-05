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

        // POST: api/helperprofiles/admin/create
        // Admin tạo Helper mới (bao gồm cả User + HelperProfile)
        [HttpPost("admin/create")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AdminCreateHelper([FromBody] AdminHelperCreateDTO dto)
        {
            try
            {
                var result = await _service.CreateHelperWithUserAsync(dto);
                return CreatedAtAction(nameof(GetByUserId), new { userId = result.UserId }, result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
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

        [HttpPost("available")]
        public async Task<IActionResult> GetAvailableHelpers([FromBody] AvailableHelperFilterDTO filter)
        {
            // Có thể validate thêm logic: Ngày bắt đầu phải lớn hơn hiện tại...
            if (filter.StartDate < DateTime.Today)
            {
                return BadRequest(new { message = "Ngày tìm kiếm không hợp lệ." });
            }

            var result = await _service.GetAvailableHelpersAsync(filter);

            // Nếu không có ai rảnh
            if (!result.Any())
            {
                return Ok(new { message = "Không tìm thấy người giúp việc nào rảnh trong khung giờ này.", data = result });
            }

            return Ok(result);
        }

        // GET: api/helperprofiles
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var results = await _service.GetAllAsync();
            return Ok(results);
        }

        // DELETE: api/helperprofiles/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _service.SoftDeleteAsync(id);
            if (!success)
            {
                return NotFound(new { message = "Không tìm thấy hồ sơ để xóa." });
            }
            return Ok(new { message = "Xóa hồ sơ thành công." });
        }
    }
}