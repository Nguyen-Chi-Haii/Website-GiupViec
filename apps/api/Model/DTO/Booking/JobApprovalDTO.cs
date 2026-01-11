using System.ComponentModel.DataAnnotations;

namespace GiupViecAPI.Model.DTO.Booking
{
    public class JobApprovalDTO
    {
        public string? Note { get; set; }
    }

    public class JobRejectionDTO
    {
        [Required(ErrorMessage = "Vui lòng nhập lý do từ chối")]
        public string? Reason { get; set; }
    }
}
