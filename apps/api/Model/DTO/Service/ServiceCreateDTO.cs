using System.ComponentModel.DataAnnotations;

namespace GiupViecAPI.Model.DTO.Service
{
    public class ServiceCreateDTO
    {
        [Required(ErrorMessage = "Tên dịch vụ không được để trống")]
        [MaxLength(100, ErrorMessage = "Tên dịch vụ không quá 100 ký tự")]
        public string? Name { get; set; }
        public string? Description { get; set; }
        public int? HelperId { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Giá không được nhỏ hơn 0")]
        public decimal Price { get; set; }

        public string? Unit { get; set; } // Map từ enum string
        public string? UnitLabel { get; set; }
        public double MinQuantity { get; set; } = 1;
        public bool RequiresNotes { get; set; } = false;
        public string? NotePrompt { get; set; }
        public string? Icon { get; set; }

        public bool IsActive { get; set; } = true;
    }
}
