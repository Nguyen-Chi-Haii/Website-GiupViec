using AutoMapper;
using GiupViecAPI.Data;
using GiupViecAPI.Model.Domain;
using GiupViecAPI.Model.DTO.Auth;
using GiupViecAPI.Model.DTO.User;
using GiupViecAPI.Model.Enums;
using GiupViecAPI.Services.Interface;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using BCrypt.Net;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace GiupViecAPI.Services.Repositories
{
    public class UserService: IUserService
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

        public async Task<IEnumerable<UserResponseDTO>> GetAllAsync()
        {
            var users = await _db.Users.ToListAsync();
            return _mapper.Map<IEnumerable<UserResponseDTO>>(users);
        }

        public async Task<UserResponseDTO> CreateAsync(UserCreateDTO DTO)
        {
            var user = _mapper.Map<User>(DTO);
            // With the following code:
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(DTO.Password);

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return _mapper.Map<UserResponseDTO>(user);
        }

        public async Task<UserResponseDTO> UpdateAsync(int id, UserUpdateDTO DTO)
        {
            // 1. Tìm user
            var user = await _db.Users.FindAsync(id);
            if (user == null) return null;

            _mapper.Map(DTO, user);

            // 3. Xử lý riêng cho Mật Khẩu (Nếu người dùng có nhập pass mới)
            if (!string.IsNullOrEmpty(DTO.Password))
            {
                // Băm mật khẩu mới và gán vào PasswordHash
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(DTO.Password);
            }

            // 4. Cập nhật thời gian
            user.UpdatedAt = DateTime.UtcNow;

            // 5. Lưu vào DB
            await _db.SaveChangesAsync();

            return _mapper.Map<UserResponseDTO>(user);
        }
        public async Task<string> LoginAsync(LoginDTO loginDto)
        {
            // 1. Kiểm tra User có tồn tại trong DB không
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);
            if (user == null)
            {
                return null; // Tài khoản không tồn tại -> Trả về null luôn
            }
            bool isValid = BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash);

            if (!isValid) return null;

            // 2. Tạo Claims (Các thông tin đính kèm trong Token)
            var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.FullName),
                    new Claim(ClaimTypes.Role, user.Role.ToString()) // Ví dụ role, lấy từ DB
                };
            var secretKey = _config["Jwt:Key"];

            // Kiểm tra an toàn: Nếu quên cấu hình thì báo lỗi ngay để dễ sửa
            if (string.IsNullOrEmpty(secretKey))
            {
                throw new Exception("Chưa cấu hình Jwt:Key trong appsettings.json");
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // 5. Đọc cả Issuer và Audience từ config cho đồng bộ (Optional)
            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        public async Task<UserResponseDTO> GetByIdAsync(int id)
        {
            // FindAsync tối ưu nhất khi tìm theo Khóa chính (Primary Key)
            var user = await _db.Users.FindAsync(id);

            if (user == null)
            {
                return null; // Không tìm thấy
            }

            return _mapper.Map<UserResponseDTO>(user);
        }
    }
}
