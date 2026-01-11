using GiupViecAPI.Model.DTO.Shared;
using System.ComponentModel.DataAnnotations;

namespace GiupViecAPI.Model.DTO.Booking
{
    public class AvailableJobFilterDTO : BaseFilterDTO
    {
        public int? ServiceId { get; set; }
        
        // Filter theo thời gian
        public DateTime? StartDateFrom { get; set; }
        public DateTime? StartDateTo { get; set; }
        
        // Filter theo giá (New)
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        
        // Filter theo địa điểm (New)
        public string? Province { get; set; }
        
        // Sorting managed by BaseFilterDTO (SortBy, IsDescending)
    }
}
