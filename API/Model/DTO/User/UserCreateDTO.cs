using GiupViecAPI.Model.Enums;
using System.ComponentModel.DataAnnotations;

namespace GiupViecAPI.Model.DTO.User
{
    public class UserCreateDTO
    {
        [Required]
        [MaxLength(100)]
        public string FullName { get; set; }

        [Required]
        [EmailAddress]
        [MaxLength(150)]
        public string Email { get; set; }

        [Phone]
        [MaxLength(20)]
        public string Phone { get; set; }

        [Required]
        public string Password { get; set; }   // gửi từ FE → Hash ở backend

        public string Avatar { get; set; }

        [Required]
        public UserRoles Role { get; set; }

        [Required]
        public UserStatus Status { get; set; }

        [MaxLength(255)]
        public string Address { get; set; }
    }
}
