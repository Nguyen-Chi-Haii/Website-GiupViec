using Microsoft.AspNetCore.SignalR;
using GiupViecAPI.Services.Interface;
using GiupViecAPI.Model.DTO.Message;

public class ChatHub : Hub
{
    private readonly IMessageService _messageService;
    private readonly IBookingService _bookingService;

    public ChatHub(IMessageService messageService, IBookingService bookingService)
    {
        _messageService = messageService;
        _bookingService = bookingService;
    }

    public async Task JoinBookingGroup(string bookingId)
    {
        var userIdString = Context.UserIdentifier;

        if (int.TryParse(bookingId, out int bId) && userIdString != null)
        {
            var booking = await _bookingService.GetByIdAsync(bId);
        }
        await Groups.AddToGroupAsync(Context.ConnectionId, bookingId);
    }

    // Sửa lại hàm này để nhận DTO
    public async Task SendMessageToBooking(CreateMessageDTO input)
    {
        // 1. Gọi Service để lưu DB
        var savedMessage = await _messageService.SendMessageAsync(input);

        // 2. Gửi tin nhắn đã lưu (kèm Id, SentAt chuẩn từ server) tới các client
        await Clients.Group(input.BookingId.ToString()).SendAsync("ReceiveMessage", savedMessage);
    }
}