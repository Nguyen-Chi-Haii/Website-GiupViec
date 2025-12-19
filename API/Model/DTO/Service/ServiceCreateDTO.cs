using System.ComponentModel.DataAnnotations;

namespace GiupViecAPI.Model.DTO.Service
{
    public class ServiceCreateDTO
    {
        [Required(ErrorMessage = "Tên dịch vụ không được để trống")]
        [MaxLength(100, ErrorMessage = "Tên dịch vụ không quá 100 ký tự")]
        public string Name { get; set; }
        public int? HelperId { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Giá không được nhỏ hơn 0")]
        public decimal Price { get; set; }

        public bool IsActive { get; set; } = true; // Mặc định là Active
    }
}
