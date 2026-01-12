using GiupViecAPI.Model.DTO.Shared;

namespace GiupViecAPI.Model.DTO.HelperProfile
{
    public class HelperProfileFilterDTO : BaseFilterDTO
    {
        public int? MinExperience { get; set; }
        public double? MinRating { get; set; }
        public decimal? MinHourlyRate { get; set; }
        public decimal? MaxHourlyRate { get; set; }
        public string? ActiveArea { get; set; }
        public GiupViecAPI.Model.Enums.UserStatus? Status { get; set; }
    }
}
