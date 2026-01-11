using System.ComponentModel.DataAnnotations;

namespace GiupViecAPI.Model.DTO.HelperProfile
{
    public class AdminHelperCreateDTO
    {
        // User Information
        [Required(ErrorMessage = "Họ và tên là bắt buộc")]
        [MaxLength(100)]
        public string? FullName { get; set; }

        [Required(ErrorMessage = "Email là bắt buộc")]
        [EmailAddress(ErrorMessage = "Email không đúng định dạng")]
        [MaxLength(150)]
        public string? Email { get; set; }

        [Required(ErrorMessage = "Số điện thoại là bắt buộc")]
        [RegularExpression(@"^(0|\+84)[0-9]{9,10}$", ErrorMessage = "Số điện thoại không đúng định dạng")]
        [MaxLength(20)]
        public string? Phone { get; set; }

        [Required(ErrorMessage = "Mật khẩu là bắt buộc")]
        [MinLength(6, ErrorMessage = "Mật khẩu phải từ 6 ký tự trở lên")]
        public string? Password { get; set; }

        public string? Avatar { get; set; }

        public string? Address { get; set; }

        // HelperProfile Information
        [Required(ErrorMessage = "Vui lòng nhập khu vực hoạt động")]
        public string? ActiveArea { get; set; }

        public string? Bio { get; set; }

        [Range(0, 50, ErrorMessage = "Số năm kinh nghiệm không hợp lệ")]
        public int ExperienceYears { get; set; } = 0;

        [Range(0, double.MaxValue, ErrorMessage = "Giá tiền không hợp lệ")]
        public decimal? HourlyRate { get; set; }
    }
}
