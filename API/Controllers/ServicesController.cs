using GiupViecAPI.Model.DTO.Service;
using GiupViecAPI.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GiupViecAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServicesController : ControllerBase
    {
        private readonly IServiceService _service;

        public ServicesController(IServiceService service)
        {
            _service = service;
        }

        // GET: api/services
        // Không để [Authorize] để khách vãng lai cũng xem được giá
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

        // GET: api/services/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _service.GetByIdAsync(id);
            if (result == null)
            {
                return NotFound(new { message = "Không tìm thấy dịch vụ" });
            }
            return Ok(result);
        }

        // POST: api/services
        // Cần đăng nhập mới được thêm
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] ServiceCreateDTO dto)
        {
            var result = await _service.CreateAsync(dto);
            // Trả về mã 201 Created và đường dẫn để lấy chi tiết
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }

        // PUT: api/services/5
        // Cần đăng nhập mới được sửa
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] ServiceUpdateDTO dto)
        {
            var result = await _service.UpdateAsync(id, dto);

            if (result == null)
            {
                return NotFound(new { message = "Không tìm thấy dịch vụ để cập nhật" });
            }

            return Ok(result);
        }
    }
}