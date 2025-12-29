using Microsoft.AspNetCore.Identity;
using GiupViecAPI.Model.Enums;
using System.ComponentModel.DataAnnotations;

namespace GiupViecAPI.Model.Domain
{
    public class User : IdentityUser<int>
    {
      
        [Required]
        [MaxLength(100)]
        public string FullName { get; set; }

        public string Address { get; set; }

        public string Avatar { get; set; }
        [Required]
        public UserRoles Role { get; set; }

        [Required]
        public UserStatus Status { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Relationship
        public HelperProfile? HelperProfile { get; set; }
    }
}