using GiupViecAPI.Model.DTO.User;
using GiupViecAPI.Model.Enums;
using GiupViecAPI.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GiupViecAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _service;

        public UsersController(IUserService service)
        {
            _service = service;
        }

        // Register endpoint đã được chuyển sang AuthController để tránh trùng lặp
        // POST: /api/Auth/register

        // GET: api/users
        // Chỉ Admin mới được xem danh sách User
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            var users = await _service.GetAllAsync();
            return Ok(users);
        }

        // GET: api/users/5
        // Admin xem được tất cả, User thường chỉ xem được chính mình
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetById(int id)
        {
            // Logic kiểm tra quyền: Nếu không phải Admin thì ID phải trùng với ID của người đang login
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            if (role != "Admin" && currentUserId != id)
            {
                return Forbid(); // Trả về lỗi 403 Forbidden
            }

            var user = await _service.GetByIdAsync(id);
            if (user == null) return NotFound(new { message = "Không tìm thấy người dùng." });

            return Ok(user);
        }

        // PUT: api/users/5
        // Cập nhật thông tin cá nhân
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] UserUpdateDTO dto)
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            var currentUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            // Chỉ cho phép tự sửa chính mình (trừ khi bạn muốn Admin sửa hộ)
            if (currentUserId != id && role != "Admin")
            {
                return Forbid();
            }

            var result = await _service.UpdateAsync(id, dto);
            if (result == null) return NotFound(new { message = "User không tồn tại." });

            return Ok(result);
        }
    }
}