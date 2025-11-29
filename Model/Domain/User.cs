using GiupViecAPI.Model.Enums;
using System.ComponentModel.DataAnnotations;

namespace GiupViecAPI.Model.Domain
{
    public class User
    {
        [Key]
        public int Id { get; set; }

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

        public string Address { get; set; }

        [Required]
        public string PasswordHash { get; set; }

        public string Avatar { get; set; }

        // Role: Admin / Employee / Helper / Customer
        [Required]
        [MaxLength(20)]
        public UserRoles Role { get; set; }

        // Status: Active / Inactive
        [Required]
        [MaxLength(20)]
        public UserStatus Status { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
