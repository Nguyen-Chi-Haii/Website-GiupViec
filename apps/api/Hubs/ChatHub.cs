using GiupViecAPI.Data;
using GiupViecAPI.Model.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace GiupViecAPI.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly GiupViecDBContext _context;

        public ChatHub(GiupViecDBContext context)
        {
            _context = context;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.UserIdentifier;
            if (!string.IsNullOrEmpty(userId))
            {
                // We could map ConnectionId to UserId here if needed, 
                // but SignalR handles Clients.User(userId) automatically if UserIdentifier matches.
                await base.OnConnectedAsync();
            }
        }

        public async Task SendMessage(int receiverId, string content, int? bookingId = null)
        {
            var senderIdStr = Context.UserIdentifier;
            if (string.IsNullOrEmpty(senderIdStr) || !int.TryParse(senderIdStr, out int senderId)) return;

            // Save to DB
            var message = new Message
            {
                SenderId = senderId,
                ReceiverId = receiverId,
                Content = content,
                SentAt = DateTime.UtcNow,
                IsRead = false,
                BookingId = bookingId
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            // Send to Receiver
            await Clients.User(receiverId.ToString()).SendAsync("ReceiveMessage", new
            {
                Id = message.Id,
                SenderId = message.SenderId,
                ReceiverId = message.ReceiverId,
                Content = message.Content,
                SentAt = message.SentAt,
                IsRead = message.IsRead,
                BookingId = message.BookingId
            });

            // Send back to Sender (for UI update consistency, optional but good for multiple tabs)
            await Clients.User(senderIdStr).SendAsync("ReceiveMessage", new
            {
                Id = message.Id,
                SenderId = message.SenderId,
                ReceiverId = message.ReceiverId,
                Content = message.Content,
                SentAt = message.SentAt,
                IsRead = message.IsRead,
                BookingId = message.BookingId
            });
        }
    }
}
