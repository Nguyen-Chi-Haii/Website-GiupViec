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

        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (userIdClaim == null) return Unauthorized();
        int customerId = int.Parse(userIdClaim.Value);

        try
        {
            // --- SỬA TẠI ĐÂY: Gọi Service để thực thi Stored Procedure ---
            // Thay vì gọi _context.Reviews.Add(reviewDto), ta gọi hàm xử lý DB
            var result = await _reviewService.CreateReviewAsync(reviewDto, customerId);

            if (result == null) return BadRequest("Không thể gửi đánh giá.");

            return Ok(result);
        }
        catch (Exception ex)
        {
            // --- KHÔNG ĐỔI: Catch lỗi từ Database (ví dụ: vi phạm ràng buộc) ---
            return BadRequest(ex.Message);
        }
    }

    // GET: api/Reviews/Helper/H001
    [HttpGet("Helper/{helperId}")]
    public async Task<IActionResult> GetHelperReviews(int helperId)
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