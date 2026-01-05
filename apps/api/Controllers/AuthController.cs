using GiupViecAPI.Model.DTO.Auth;
using GiupViecAPI.Model.DTO.User;
using GiupViecAPI.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GiupViecAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;

        public AuthController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO loginDto)
        {
            var result = await _userService.LoginAsync(loginDto);

            if (result == null)
                return Unauthorized(new { message = "Sai tài khoản hoặc mật khẩu" });

            return Ok(result);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserCreateDTO registerDto)
        {
            try
            {
                var user = await _userService.RegisterAsync(registerDto);
                return CreatedAtAction(null, new { id = user.Id }, user);
            }
            catch (Exception ex)
            {
                var message = ex.InnerException?.Message ?? ex.Message;
                return BadRequest(new { message });
            }
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDTO dto)
        {
            // Validate passwords match
            if (dto.NewPassword != dto.ConfirmPassword)
            {
                return BadRequest(new { message = "Mật khẩu mới không khớp với xác nhận mật khẩu" });
            }

            // Validate password strength
            if (dto.NewPassword.Length < 6)
            {
                return BadRequest(new { message = "Mật khẩu mới phải có ít nhất 6 ký tự" });
            }

            // Get user ID from token
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized(new { message = "Không tìm thấy thông tin người dùng" });
            }

            int userId = int.Parse(userIdClaim.Value);

            var success = await _userService.ChangePasswordAsync(userId, dto.CurrentPassword, dto.NewPassword);

            if (!success)
            {
                return BadRequest(new { message = "Mật khẩu hiện tại không đúng" });
            }

            return Ok(new { message = "Đổi mật khẩu thành công!" });
        }
    }
}
