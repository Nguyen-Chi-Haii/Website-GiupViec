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
        public async Task<IActionResult> GetAll([FromQuery] ServiceFilterDTO filter)
        {
            var result = await _service.GetAllAsync(filter);
            return Ok(result);
        }

        // GET: api/services/unit-labels
        [HttpGet("unit-labels")]
        public async Task<IActionResult> GetUnitLabels()
        {
            var result = await _service.GetUnitLabelsAsync();
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

        [HttpPost]
        [Authorize(Roles = "Admin")] // <--- SỬA: Chỉ Admin mới được tạo dịch vụ
        public async Task<IActionResult> Create([FromBody] ServiceCreateDTO dto)
        {
            // --- THÊM TRY-CATCH ---
            try
            {
                var result = await _service.CreateAsync(dto);
                if (result == null) return BadRequest(new { message = "Không thể tạo dịch vụ" });
                return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
            }
            catch (Exception ex)
            {
                // Bắt lỗi trùng tên từ Service ném ra
                return BadRequest(new { message = ex.Message });
            }
            // -----------------------
        }

        // PUT: api/services/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")] // <--- SỬA: Chỉ Admin mới được sửa
        public async Task<IActionResult> Update(int id, [FromBody] ServiceUpdateDTO dto)
        {
            // --- THÊM TRY-CATCH ---
            try
            {
                var result = await _service.UpdateAsync(id, dto);

                if (result == null)
                {
                    return NotFound(new { message = "Không tìm thấy dịch vụ để cập nhật" });
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                // Bắt lỗi trùng tên hoặc lỗi logic khác
                return BadRequest(new { message = ex.Message });
            }
            // -----------------------
        }
    }
}