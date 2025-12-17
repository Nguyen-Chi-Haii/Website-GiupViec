namespace GiupViecAPI.Model.DTO.Message
{
    public class CreateMessageDTO

    {
        public int BookingId { get; set; }
        public int SenderId { get; set; }
        public int ReceiverId { get; set; }
        public string Content { get; set; }
    }
}
