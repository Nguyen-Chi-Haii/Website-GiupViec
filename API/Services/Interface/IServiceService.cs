using GiupViecAPI.Model.DTO.Service;

namespace GiupViecAPI.Services.Interface
{
    public interface IServiceService
    {
        Task<IEnumerable<ServiceResponseDTO>> GetAllAsync();
        Task<ServiceResponseDTO> GetByIdAsync(int id);
        Task<ServiceResponseDTO> CreateAsync(ServiceCreateDTO dto);
        Task<ServiceResponseDTO> UpdateAsync(int id, ServiceUpdateDTO dto);
    }
}
