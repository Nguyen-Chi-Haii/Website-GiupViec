using GiupViecAPI.Model.DTO.Auth;
using GiupViecAPI.Model.DTO.User;

namespace GiupViecAPI.Services.Interface
{
    public interface IUserService
    {
        // Đổi tên CreateAsync -> RegisterAsync
        Task<UserResponseDTO> RegisterAsync(UserCreateDTO dto);

        Task<string> LoginAsync(LoginDTO loginDto);

        Task<IEnumerable<UserResponseDTO>> GetAllAsync();

        Task<UserResponseDTO> GetByIdAsync(int id);

        // Bổ sung thêm hàm Update nếu cần
        Task<UserResponseDTO> UpdateAsync(int id, UserUpdateDTO dto);
    }
}