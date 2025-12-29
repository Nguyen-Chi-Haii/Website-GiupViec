using GiupViecAPI.Model.DTO.Auth;
using GiupViecAPI.Model.DTO.User;
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
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
