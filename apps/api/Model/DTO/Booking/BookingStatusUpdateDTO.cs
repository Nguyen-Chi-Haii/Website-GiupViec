using GiupViecAPI.Model.Enums;
using System.ComponentModel.DataAnnotations;

namespace GiupViecAPI.Model.DTO.Booking
{
    public class BookingStatusUpdateDTO
    {
        [Required(ErrorMessage = "Trạng thái là bắt buộc")]
        public BookingStatus Status { get; set; }
    }
}
