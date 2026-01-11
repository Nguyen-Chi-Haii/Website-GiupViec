namespace GiupViecAPI.Model.DTO.Service
{
    public class ServiceResponseDTO
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public string? Unit { get; set; } // Trả về string (Hour, Piece, etc.)
        public string? UnitLabel { get; set; }
        public double MinQuantity { get; set; }
        public bool RequiresNotes { get; set; }
        public string? NotePrompt { get; set; }
        public string? Icon { get; set; }
        public bool IsActive { get; set; }
    }
}
