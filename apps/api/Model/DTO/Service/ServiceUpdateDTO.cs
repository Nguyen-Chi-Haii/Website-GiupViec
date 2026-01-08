using System.ComponentModel.DataAnnotations;

namespace GiupViecAPI.Model.DTO.Service
{
    public class ServiceUpdateDTO
    {
        [Required(ErrorMessage = "Tên dịch vụ không được để trống")]
        [MaxLength(100)]
        public string Name { get; set; }

        public string? Description { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Giá không được nhỏ hơn 0")]
        public decimal Price { get; set; }

        public string? Unit { get; set; }
        public string? UnitLabel { get; set; }
        public double? MinQuantity { get; set; }
        public bool? RequiresNotes { get; set; }
        public string? NotePrompt { get; set; }
        public string? Icon { get; set; }

        public bool? IsActive { get; set; }
    }
}
