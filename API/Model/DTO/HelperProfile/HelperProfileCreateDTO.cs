using System.ComponentModel.DataAnnotations;

namespace GiupViecAPI.Model.DTO.HelperProfile
{
    public class HelperProfileCreateDTO
    {
        [Required]
        public int UserId { get; set; } // Bắt buộc phải biết tạo cho ai

        [Required(ErrorMessage = "Vui lòng nhập khu vực hoạt động")]
        public string ActiveArea { get; set; }
    }
}
