using GiupViecAPI.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace GiupViecAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly GiupViecDBContext _context;

        public ChatController(GiupViecDBContext context)
        {
            _context = context;
        }

        // Get list of users the current user has chatted with
        [HttpGet("conversations")]
        public async Task<IActionResult> GetConversations()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);

            // Get IDs of users who sent messages to me or received messages from me
            // Get IDs of users who sent messages to me or received messages from me
            // Exclude self-messages to prevent "talking to self" appearing in list
            var partnerIds = await _context.Messages
                .Where(m => m.SenderId == userId || m.ReceiverId == userId)
                .Select(m => m.SenderId == userId ? m.ReceiverId : m.SenderId)
                .Where(id => id != userId) 
                .Distinct()
                .ToListAsync();

            var partners = await _context.Users
                .Where(u => partnerIds.Contains(u.Id))
                .Select(u => new 
                {
                    UserId = u.Id,
                    u.FullName,
                    u.Avatar,
                    Role = u.Role.ToString(),
                    LastMessage = _context.Messages
                        .Where(m => (m.SenderId == userId && m.ReceiverId == u.Id) || (m.SenderId == u.Id && m.ReceiverId == userId))
                        .OrderByDescending(m => m.SentAt)
                        .Select(m => m.Content)
                        .FirstOrDefault(),
                    LastMessageTime = _context.Messages
                        .Where(m => (m.SenderId == userId && m.ReceiverId == u.Id) || (m.SenderId == u.Id && m.ReceiverId == userId))
                        .OrderByDescending(m => m.SentAt)
                        .Select(m => (DateTime?)m.SentAt)
                        .FirstOrDefault(),
                    UnreadCount = _context.Messages
                        .Count(m => m.ReceiverId == userId && m.SenderId == u.Id && !m.IsRead)
                })
                .ToListAsync();
            
            // Order by most recent message
            return Ok(partners.OrderByDescending(p => p.LastMessageTime));
        }

        // Get history with specific user
        [HttpGet("history/{partnerId}")]
        public async Task<IActionResult> GetHistory(int partnerId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);

            var messages = await _context.Messages
                .Where(m => (m.SenderId == userId && m.ReceiverId == partnerId) || 
                            (m.SenderId == partnerId && m.ReceiverId == userId))
                .OrderBy(m => m.SentAt)
                .Select(m => new
                {
                    m.Id,
                    m.SenderId,
                    m.ReceiverId,
                    m.Content,
                    m.SentAt,
                    m.IsRead
                })
                .ToListAsync();

            // Mark as read
            var unreadMessages = await _context.Messages
                .Where(m => m.SenderId == partnerId && m.ReceiverId == userId && !m.IsRead)
                .ToListAsync();

            if (unreadMessages.Any())
            {
                foreach (var msg in unreadMessages)
                {
                    msg.IsRead = true;
                    msg.ReadAt = DateTime.UtcNow;
                }
                await _context.SaveChangesAsync();
            }

            return Ok(messages);
        }
        // Get Support Contact (Admin or Employee)
        [HttpGet("support-contact")]
        public async Task<IActionResult> GetSupportContact()
        {
            var supportUser = await _context.Users
                .Where(u => u.Role == Model.Enums.UserRoles.Admin || u.Role == Model.Enums.UserRoles.Employee)
                .Where(u => u.Status == Model.Enums.UserStatus.Active)
                .Select(u => new
                {
                    UserId = u.Id,
                    u.FullName,
                    u.Avatar,
                    Role = u.Role.ToString(),
                    LastMessage = "",
                    LastMessageTime = (DateTime?)DateTime.UtcNow,
                    UnreadCount = 0
                })
                .FirstOrDefaultAsync();

            if (supportUser == null) return NotFound("Không tìm thấy nhân viên hỗ trợ.");

            return Ok(supportUser);
        }
    }
}
