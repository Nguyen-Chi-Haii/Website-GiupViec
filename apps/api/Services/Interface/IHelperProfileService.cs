using GiupViecAPI.Model.DTO.HelperProfile;

namespace GiupViecAPI.Services.Interface
{
    public interface IHelperProfileService
    {
        Task<HelperProfileResponseDTO> GetByUserIdAsync(int userId);

        Task<HelperProfileResponseDTO> CreateAsync(HelperProfileCreateDTO dto);

        Task<HelperProfileResponseDTO> UpdateAsync(int userId, HelperProfileUpdateDTO dto);
        Task<IEnumerable<HelperSuggestionDTO>> GetAvailableHelpersAsync(AvailableHelperFilterDTO filter);
    }

}
