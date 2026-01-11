using GiupViecAPI.Model.DTO.Shared;

namespace GiupViecAPI.Model.DTO.Service
{
    public class ServiceFilterDTO : BaseFilterDTO
    {
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
    }
}
