using GiupViecAPI.Model.DTO.Shared;
using GiupViecAPI.Model.Enums;

namespace GiupViecAPI.Model.DTO.Booking
{
    public class BookingFilterDTO : BaseFilterDTO
    {
        public BookingStatus? Status { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int? CustomerId { get; set; }
        public int? HelperId { get; set; }
        public int? ServiceId { get; set; }
        public bool? IsJobPost { get; set; }
        public PaymentStatus? PaymentStatus { get; set; }
        public ApprovalStatus? ApprovalStatus { get; set; }
    }
}
