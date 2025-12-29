using AutoMapper;
using GiupViecAPI.Data;
using GiupViecAPI.Model.Domain;
using GiupViecAPI.Model.DTO.Auth;
using GiupViecAPI.Model.DTO.User;
using GiupViecAPI.Services.Interface;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace GiupViecAPI.Services.Repositories
{
    public class UserService : IUserService
    {
        private readonly GiupViecDBContext _db;
        private readonly IMapper _mapper;
        private readonly IConfiguration _config;

        public UserService(GiupViecDBContext db, IMapper mapper, IConfiguration config)
        {
            _db = db;
            _mapper = mapper;
            _config = config;
        }

        // 1. ĐĂNG KÝ (Register)
        public async Task<UserResponseDTO> RegisterAsync(UserCreateDTO dto)
        {
            // Kiểm tra email đã tồn tại chưa
            if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
            {
                throw new Exception("Email này đã được sử dụng.");
            }

            var user = _mapper.Map<User>(dto);

            // --- Băm mật khẩu (Hashing) ---
            var passwordHasher = new PasswordHasher<User>();
            user.PasswordHash = passwordHasher.HashPassword(user, dto.Password);
            // ------------------------------

            await _db.Users.AddAsync(user);
            await _db.SaveChangesAsync();

            return _mapper.Map<UserResponseDTO>(user);
        }

        // 2. ĐĂNG NHẬP (Login & Generate JWT)
        public async Task<string> LoginAsync(LoginDTO loginDto)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            // Kiểm tra User có tồn tại không
            if (user == null) return null;

            // Kiểm tra Mật khẩu
            var passwordHasher = new PasswordHasher<User>();
            var result = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, loginDto.Password);

            if (result == PasswordVerificationResult.Failed) return null;

            // --- TẠO JWT TOKEN ---
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString()) // Quan trọng: Lưu Role vào Token
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(1), // Token sống 1 ngày
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // 3. LẤY DANH SÁCH USER
        public async Task<IEnumerable<UserResponseDTO>> GetAllAsync()
        {
            var users = await _db.Users.OrderByDescending(u => u.CreatedAt).ToListAsync();
            return _mapper.Map<IEnumerable<UserResponseDTO>>(users);
        }

        // 4. LẤY CHI TIẾT USER
        public async Task<UserResponseDTO> GetByIdAsync(int id)
        {
            var user = await _db.Users.FindAsync(id);
            if (user == null) return null;
            return _mapper.Map<UserResponseDTO>(user);
        }

        // 5. CẬP NHẬT USER (Bổ sung thêm cho đầy đủ)
        public async Task<UserResponseDTO> UpdateAsync(int id, UserUpdateDTO dto)
        {
            var user = await _db.Users.FindAsync(id);
            if (user == null) return null;

            // Map dữ liệu update (chỉ map những trường không null)
            _mapper.Map(dto, user);

            // Nếu có đổi mật khẩu thì phải hash lại
            if (!string.IsNullOrEmpty(dto.Password))
            {
                var passwordHasher = new PasswordHasher<User>();
                user.PasswordHash = passwordHasher.HashPassword(user, dto.Password);
            }

            user.UpdatedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            return _mapper.Map<UserResponseDTO>(user);
        }
    }
}