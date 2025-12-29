using System.ComponentModel.DataAnnotations;

namespace GiupViecAPI.Model.DTO.HelperProfile
{
    public class AvailableHelperFilterDTO
    {
        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Required]
        public TimeSpan WorkShiftStart { get; set; }

        [Required]
        public TimeSpan WorkShiftEnd { get; set; }
    }
}