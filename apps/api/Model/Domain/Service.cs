using System.ComponentModel.DataAnnotations;
using GiupViecAPI.Model.Enums;

namespace GiupViecAPI.Model.Domain
{
    public class Service
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public ServiceUnit Unit { get; set; } = ServiceUnit.Hour;
        public string? UnitLabel { get; set; } // e.g., "giờ", "máy", "m2"
        public double MinQuantity { get; set; } = 1;
        public bool RequiresNotes { get; set; } = false;
        public string? NotePrompt { get; set; } // e.g., "Ghi chú thực đơn..."
        public string? Icon { get; set; } // Material Icon name
        public bool IsActive { get; set; } = true;
    }
}
