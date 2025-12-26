using GiupViecAPI.Model.Enums;
using System.ComponentModel.DataAnnotations;

namespace GiupViecAPI.Model.DTO.User
{
    public class UserCreateDTO
    {
        [Required(ErrorMessage = "Họ và tên là bắt buộc")]
        [MaxLength(100, ErrorMessage = "Họ tên không được vượt quá 100 ký tự")] // Khớp với Domain [MaxLength(100)]
        public string FullName { get; set; }

        [Required(ErrorMessage = "Email là bắt buộc")]
        [EmailAddress(ErrorMessage = "Email không đúng định dạng")]
        [MaxLength(150, ErrorMessage = "Email không được vượt quá 150 ký tự")] // Khớp với Domain [MaxLength(150)]
        public string Email { get; set; }

        [RegularExpression(@"^(0|\+84)[0-9]{9,10}$", ErrorMessage = "Số điện thoại không đúng định dạng (VD: 0912345678 hoặc +84912345678)")]
        [MaxLength(20, ErrorMessage = "Số điện thoại không được vượt quá 20 ký tự")] // Khớp với Domain [MaxLength(20)]
        public string? Phone { get; set; } // Cho phép null nếu Domain không bắt buộc

        [Required(ErrorMessage = "Mật khẩu là bắt buộc")]
        [MinLength(6, ErrorMessage = "Mật khẩu phải từ 6 ký tự trở lên")]
        public string Password { get; set; } // Sẽ được map sang PasswordHash trong Domain

        public string? Avatar { get; set; }

        // Đã bỏ [MaxLength(255)] để đồng nhất với Domain (Domain không giới hạn)
        public string? Address { get; set; }

        [Required(ErrorMessage = "Vui lòng chọn vai trò")]
        public UserRoles Role { get; set; }

        [Required(ErrorMessage = "Vui lòng chọn trạng thái")]
        public UserStatus Status { get; set; }
    }
}