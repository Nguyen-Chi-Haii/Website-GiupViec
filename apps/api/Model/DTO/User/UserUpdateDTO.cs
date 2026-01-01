using System.ComponentModel.DataAnnotations;
using GiupViecAPI.Model.Enums;

namespace GiupViecAPI.Model.DTO.User
{
    public class UserUpdateDTO
    {
        [MaxLength(100, ErrorMessage = "Họ tên không được vượt quá 100 ký tự")]
        public string? FullName { get; set; }

        [MinLength(6, ErrorMessage = "Mật khẩu phải từ 6 ký tự trở lên")]
        public string? Password { get; set; } // Nếu null nghĩa là không đổi mật khẩu

        [Phone(ErrorMessage = "Số điện thoại không đúng định dạng")]
        [MaxLength(20, ErrorMessage = "Số điện thoại không được vượt quá 20 ký tự")]
        public string? Phone { get; set; }

        public string? Avatar { get; set; }

        public string? Address { get; set; }

        // Thêm Role và Status để Admin có thể cập nhật
        public UserRoles? Role { get; set; }
        public UserStatus? Status { get; set; }
    }
}