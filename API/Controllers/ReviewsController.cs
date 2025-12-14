using GiupViecAPI.Model.DTO.Reviews;
using GiupViecAPI.Services.Interface;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

[Route("api/[controller]")]
[ApiController]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public ReviewsController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    // POST: api/Reviews
    [HttpPost]
    public async Task<IActionResult> CreateReview([FromBody] CreateReviewDTO input)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await _reviewService.CreateReviewAsync(input);
        return Ok(result);
    }

    // GET: api/Reviews/Helper/H001
    [HttpGet("Helper/{helperId}")]
    public async Task<IActionResult> GetHelperReviews(string helperId)
    {
        var reviews = await _reviewService.GetReviewsByHelperAsync(helperId);
        return Ok(reviews);
    }

    // GET: api/Reviews/Booking/105
    [HttpGet("Booking/{bookingId}")]
    public async Task<IActionResult> GetBookingReview(int bookingId)
    {
        var review = await _reviewService.GetReviewByBookingIdAsync(bookingId);
        if (review == null) return NotFound("Chưa có đánh giá cho booking này");

        return Ok(review);
    }
}