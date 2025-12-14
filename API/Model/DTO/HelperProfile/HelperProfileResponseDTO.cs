namespace GiupViecAPI.Model.DTO.HelperProfile
{
    public class HelperProfileResponseDTO
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } // Để hiển thị tên cho tiện
        public decimal RatingAverage { get; set; }
        public string ActiveArea { get; set; }
    }
}
