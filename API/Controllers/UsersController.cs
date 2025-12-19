using GiupViecAPI.Model.DTO.User;
using GiupViecAPI.Model.Enums;
using GiupViecAPI.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

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

        // GET /api/users
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        // POST /api/users
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] UserCreateDTO DTO)
        {
            var user = await _service.CreateAsync(DTO);
            return CreatedAtAction(nameof(GetAll), new { id = user.Id }, user);
        }

        // PUT /api/users/{id}
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] UserUpdateDTO DTO)
        {
            var updated = await _service.UpdateAsync(id, DTO);
            if (updated == null)
                return NotFound();

            return Ok(updated);
        }
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetById(int id)
        {
            var user = await _service.GetByIdAsync(id);

            if (user == null)
            {
                return NotFound(new { message = $"Không tìm thấy user có ID = {id}" });
            }

            return Ok(user);
        }
    }
}
