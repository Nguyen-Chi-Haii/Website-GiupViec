using Microsoft.AspNetCore.SignalR;
using GiupViecAPI.Services.Interface;
using GiupViecAPI.Model.DTO.Message;

public class ChatHub : Hub
{
    private readonly IMessageService _messageService;

    public ChatHub(IMessageService messageService)
    {
        _messageService = messageService;
    }

    public async Task JoinBookingGroup(string bookingId)
    {
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