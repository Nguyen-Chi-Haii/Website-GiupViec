using GiupViecAPI.Model.DTO.Auth;
using GiupViecAPI.Model.DTO.User;

namespace GiupViecAPI.Services.Interface
{
    public interface IUserService
    {
        // Đổi tên CreateAsync -> RegisterAsync
        Task<UserResponseDTO> RegisterAsync(UserCreateDTO dto);

        Task<LoginResponseDTO> LoginAsync(LoginDTO loginDto);

        // Change password (for users who must change password on first login)
        Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword);

        Task<IEnumerable<UserResponseDTO>> GetAllAsync();

        Task<UserResponseDTO> GetByIdAsync(int id);

        // Bổ sung thêm hàm Update nếu cần
        Task<UserResponseDTO> UpdateAsync(int id, UserUpdateDTO dto);
    }
}