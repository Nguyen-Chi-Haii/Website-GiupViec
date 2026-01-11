using System.ComponentModel.DataAnnotations;

namespace GiupViecAPI.Model.DTO.HelperProfile
{
    public class HelperProfileCreateDTO
    {
        [Required]
        public int UserId { get; set; }

        [Required(ErrorMessage = "Vui lòng nhập khu vực hoạt động")]
        public string? ActiveArea { get; set; }

        // --- BỔ SUNG ---
        public string? Bio { get; set; }

        [Range(0, 50, ErrorMessage = "Số năm kinh nghiệm không hợp lệ")]
        public int ExperienceYears { get; set; } = 0;

        public decimal? HourlyRate { get; set; }
    }
}