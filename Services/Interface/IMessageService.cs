using GiupViecAPI.Model.Domain;
using GiupViecAPI.Model.DTO.Message;

namespace GiupViecAPI.Services.Interface
{
    public interface IMessageService
    {
        // Hàm tạo tin nhắn từ DTO, trả về tin nhắn đã lưu (có Id, SentAt)
        Task<Message> SendMessageAsync(CreateMessageDTO input);

        // Hàm lấy lịch sử chat
        Task<List<Message>> GetHistoryAsync(int bookingId);
    }
}
