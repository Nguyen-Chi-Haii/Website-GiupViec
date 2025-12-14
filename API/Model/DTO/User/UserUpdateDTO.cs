using GiupViecAPI.Model.Enums;
using System.ComponentModel.DataAnnotations;

namespace GiupViecAPI.Model.DTO.User
{
    public class UserUpdateDTO
    {
        [MaxLength(100)]
        public string FullName { get; set; }

        [MinLength(6, ErrorMessage = "Mật khẩu phải từ 6 ký tự trở lên")]
        public string? Password { get; set; }

        [Phone]
        [MaxLength(20)]
        public string Phone { get; set; }

        public string Avatar { get; set; }

        [MaxLength(255)]
        public string Address { get; set; }
    }
}
