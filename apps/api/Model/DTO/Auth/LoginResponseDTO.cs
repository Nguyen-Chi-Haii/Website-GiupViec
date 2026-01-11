namespace GiupViecAPI.Model.DTO.Auth
{
    public class LoginResponseDTO
    {
        public string? Token { get; set; }
        public bool MustChangePassword { get; set; }
        public int UserId { get; set; }
        public string? Email { get; set; }
        public string? FullName { get; set; }
        public string? Role { get; set; }
    }
}
