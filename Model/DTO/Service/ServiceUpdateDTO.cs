using System.ComponentModel.DataAnnotations;

namespace GiupViecAPI.Model.DTO.Service
{
    public class ServiceUpdateDTO
    {
        [Required(ErrorMessage = "Tên dịch vụ không được để trống")]
        [MaxLength(100)]
        public string Name { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Giá không được nhỏ hơn 0")]
        public decimal Price { get; set; }

        public bool IsActive { get; set; }
    }
}
