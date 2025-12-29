namespace GiupViecAPI.Model.DTO.HelperProfile
{
    public class HelperSuggestionDTO
    {
        public int Id { get; set; }
        public int UserId { get; set; } // ID này dùng để gửi vào BookingCreateDTO
        public string FullName { get; set; }
        public string Avatar { get; set; }
        public decimal RatingAverage { get; set; }
        public int ExperienceYears { get; set; }
        public string ActiveArea { get; set; }
        public string Bio { get; set; }
        public decimal HourlyRate { get; set; }
    }
}