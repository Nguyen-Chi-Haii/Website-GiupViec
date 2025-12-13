namespace GiupViecAPI.Model.DTO.Message
{
    public class CreateMessageDTO

    {
        public int BookingId { get; set; }
        public string SenderId { get; set; }
        public string ReceiverId { get; set; }
        public string Content { get; set; }
    }
}
