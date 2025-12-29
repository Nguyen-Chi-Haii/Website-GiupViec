using GiupViecAPI.Model.Enums;

namespace GiupViecAPI.Model.DTO.User
{
    public class UserResponseDTO
    {
        public int Id { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public string? Avatar { get; set; }
        public UserRoles Role { get; set; }
        public UserStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Bổ sung thêm nếu muốn trả về thông tin hồ sơ giúp việc (nếu có)
        // public int? HelperProfileId { get; set; } 
    }
}