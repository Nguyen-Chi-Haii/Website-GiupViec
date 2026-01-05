using System.ComponentModel.DataAnnotations;

namespace GiupViecAPI.Model.DTO.HelperProfile
{
    public class HelperProfileUpdateDTO
    {
        public string? ActiveArea { get; set; }
        public string? Bio { get; set; }
        public int? ExperienceYears { get; set; }
        public decimal? HourlyRate { get; set; }
    }
}