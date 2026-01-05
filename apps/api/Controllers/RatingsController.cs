using GiupViecAPI.Model.DTO.Rating;
using GiupViecAPI.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GiupViecAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class RatingsController : ControllerBase
    {
        private readonly IRatingService _ratingService;

        public RatingsController(IRatingService ratingService)
        {
            _ratingService = ratingService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateRating([FromBody] RatingCreateDTO dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized();

            int customerId = int.Parse(userIdClaim.Value);

            try
            {
                var result = await _ratingService.CreateRatingAsync(dto, customerId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("helper/{helperId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetByHelperId(int helperId)
        {
            var results = await _ratingService.GetByHelperIdAsync(helperId);
            return Ok(results);
        }
    }
}
