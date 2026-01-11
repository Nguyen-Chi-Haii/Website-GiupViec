namespace GiupViecAPI.Model.DTO.HelperProfile
{
    public class HelperProfileResponseDTO
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string? FullName { get; set; } // Tên lấy từ bảng User
        public string? Avatar { get; set; }   // Ảnh lấy từ bảng User

        public decimal RatingAverage { get; set; }
        public int RatingCount { get; set; }
        public string? ActiveArea { get; set; }

        // --- BỔ SUNG ---
        public string? Bio { get; set; }
        public int ExperienceYears { get; set; }
        public decimal HourlyRate { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public GiupViecAPI.Model.Enums.UserStatus Status { get; set; }
    }
}