using GiupViecAPI.Data;
using GiupViecAPI.Model.Domain;
using GiupViecAPI.Model.DTO.Message;
using GiupViecAPI.Services.Interface;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

public class MessageService : IMessageService
{
    private readonly GiupViecDBContext _context;

    public MessageService(GiupViecDBContext context)
    {
        _context = context;
    }

    public async Task<Message> SendMessageAsync(CreateMessageDTO input)
    {
        // Map từ DTO sang Entity
        var newMessage = new Message
        {
            BookingId = input.BookingId,
            SenderId = input.SenderId,
            ReceiverId = input.ReceiverId,
            Content = input.Content,
            SentAt = DateTime.UtcNow
        };

        _context.Messages.Add(newMessage);
        await _context.SaveChangesAsync();

        return newMessage; // Trả về để Hub gửi cho client
    }

    public async Task<List<Message>> GetHistoryAsync(int bookingId)
    {
        return await _context.Messages
            .Where(m => m.BookingId == bookingId)
            .OrderBy(m => m.SentAt)
            .ToListAsync();
    }
}