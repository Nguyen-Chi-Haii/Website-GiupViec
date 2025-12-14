using GiupViecAPI.Model.DTO.Auth;
using GiupViecAPI.Model.DTO.User;
using GiupViecAPI.Model.Enums;

namespace GiupViecAPI.Services.Interface
{

    public interface IUserService
    {
        Task<IEnumerable<UserResponseDTO>> GetAllAsync();
        Task<UserResponseDTO> CreateAsync(UserCreateDTO DTO);
        Task<UserResponseDTO> UpdateAsync(int id, UserUpdateDTO DTO);
        Task<string> LoginAsync(LoginDTO loginDto);
        Task<UserResponseDTO> GetByIdAsync(int id);
    }
}
