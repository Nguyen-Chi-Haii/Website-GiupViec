using GiupViecAPI.Model.DTO.Auth;
using GiupViecAPI.Services.Interface;
using Microsoft.AspNetCore.Mvc;

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
            var token = await _userService.LoginAsync(loginDto);

            if (token == null)
                return Unauthorized(new { message = "Sai tài khoản hoặc mật khẩu" });

            return Ok(new { token = token });
        }
    }
}
