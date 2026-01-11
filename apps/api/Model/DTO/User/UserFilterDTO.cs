using GiupViecAPI.Model.DTO.Shared;

namespace GiupViecAPI.Model.DTO.User
{
    public class UserFilterDTO : BaseFilterDTO
    {
        public string? Role { get; set; }
        public bool? IsActive { get; set; }
    }
}
