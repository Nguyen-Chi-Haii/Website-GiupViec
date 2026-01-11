using GiupViecAPI.Model.DTO.Service;
using GiupViecAPI.Model.DTO.Shared;

namespace GiupViecAPI.Services.Interface
{
    public interface IServiceService
    {
        Task<PagedResult<ServiceResponseDTO>> GetAllAsync(ServiceFilterDTO filter);
        Task<ServiceResponseDTO?> GetByIdAsync(int id);
        Task<ServiceResponseDTO?> CreateAsync(ServiceCreateDTO dto);
        Task<ServiceResponseDTO?> UpdateAsync(int id, ServiceUpdateDTO dto);
        Task<IEnumerable<string>> GetUnitLabelsAsync();
    }
}
