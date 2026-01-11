using GiupViecAPI.Model.DTO.User;
using GiupViecAPI.Model.DTO.Shared;
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
        // Admin và Employee được xem danh sách User
        [HttpGet]
        [Authorize(Roles = "Admin,Employee")]
        public async Task<IActionResult> GetAll([FromQuery] UserFilterDTO filter)
        {
            var users = await _service.GetAllAsync(filter);
            return Ok(users);
        }

        // GET: api/users/5
        // Admin, Employee xem được tất cả, User thường chỉ xem được chính mình
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetById(int id)
        {
            // Logic kiểm tra quyền: Nếu không phải Admin/Employee thì ID phải trùng với ID của người đang login
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (!int.TryParse(idClaim, out int currentUserId))
            {
                 return Unauthorized();
            }

            if (role != "Admin" && role != "Employee" && currentUserId != id)
            {
                return Forbid(); // Trả về lỗi 403 Forbidden
            }

            var user = await _service.GetByIdAsync(id);
            if (user == null) return NotFound(new { message = "Không tìm thấy người dùng." });

            return Ok(user);
        }

        // PUT: api/users/5
        // Cập nhật thông tin cá nhân hoặc Admin/Employee cập nhật hộ
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] UserUpdateDTO dto)
        {
            var role = User.FindFirst(ClaimTypes.Role)?.Value;
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (!int.TryParse(idClaim, out int currentUserId))
            {
                 return Unauthorized();
            }

            // Chỉ cho phép tự sửa chính mình hoặc Admin/Employee sửa
            if (currentUserId != id && role != "Admin" && role != "Employee")
            {
                return Forbid();
            }

            var result = await _service.UpdateAsync(id, dto);
            if (result == null) return NotFound(new { message = "User không tồn tại." });

            return Ok(result);
        }
    }
}