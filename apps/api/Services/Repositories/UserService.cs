using AutoMapper;
using GiupViecAPI.Data;
using GiupViecAPI.Model.Domain;
using GiupViecAPI.Model.DTO.Auth;
using GiupViecAPI.Model.DTO.User;
using GiupViecAPI.Model.DTO.Shared;
using GiupViecAPI.Services.Interface;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Linq.Dynamic.Core;
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

            // Fix NULL constraints & Identity fields
            user.Address ??= "Chưa cập nhật";
            user.Avatar ??= "";
            user.UserName = dto.Email;
            user.NormalizedUserName = dto.Email?.ToUpper();
            user.NormalizedEmail = dto.Email?.ToUpper();
            user.SecurityStamp = System.Guid.NewGuid().ToString();
            user.ConcurrencyStamp = System.Guid.NewGuid().ToString();

            // Băm mật khẩu
            var passwordHasher = new Microsoft.AspNetCore.Identity.PasswordHasher<User>();
            user.PasswordHash = passwordHasher.HashPassword(user, dto.Password ?? string.Empty);
            // ------------------------------

            await _db.Users.AddAsync(user);
            await _db.SaveChangesAsync();

            return _mapper.Map<UserResponseDTO>(user);
        }

        // 2. ĐĂNG NHẬP (Login & Generate JWT)
        // 2. ĐĂNG NHẬP (Login & Generate JWT)
        public async Task<LoginResponseDTO?> LoginAsync(LoginDTO loginDto)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == loginDto.Email);

            // Kiểm tra User có tồn tại không
            if (user == null) return null;

            // Kiểm tra Mật khẩu
            var passwordHasher = new PasswordHasher<User>();
            // user.PasswordHash can be null if user created externally without password, handle strictly
            if (string.IsNullOrEmpty(user.PasswordHash)) return null; 

            var result = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, loginDto.Password ?? string.Empty);

            if (result == PasswordVerificationResult.Failed) return null;

            // --- TẠO JWT TOKEN ---
            var jwtKey = _config["Jwt:Key"];
            if (string.IsNullOrEmpty(jwtKey)) throw new Exception("Jwt:Key is not configured");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email ?? ""),
                new Claim(ClaimTypes.Role, user.Role.ToString()) // Quan trọng: Lưu Role vào Token
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(1), // Token sống 1 ngày
                signingCredentials: creds
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            return new LoginResponseDTO
            {
                Token = tokenString,
                MustChangePassword = user.MustChangePassword,
                UserId = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role.ToString()
            };
        }

        // 2.5 ĐỔI MẬT KHẨU
        public async Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword)
        {
            var user = await _db.Users.FindAsync(userId);
            if (user == null) return false;

            // Verify current password
            var passwordHasher = new PasswordHasher<User>();
            var verifyResult = passwordHasher.VerifyHashedPassword(user, user.PasswordHash ?? string.Empty, currentPassword);
            if (verifyResult == PasswordVerificationResult.Failed) return false;

            // Hash and set new password
            user.PasswordHash = passwordHasher.HashPassword(user, newPassword);
            user.MustChangePassword = false; // Clear the flag
            user.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return true;
        }

        // 3. LẤY DANH SÁCH USER
        public async Task<GiupViecAPI.Model.DTO.Shared.PagedResult<UserResponseDTO>> GetAllAsync(UserFilterDTO filter)
        {
            var query = _db.Users.AsQueryable();

            if (!string.IsNullOrEmpty(filter.Keyword))
            {
                var keyword = filter.Keyword.ToLower();
                query = query.Where(u => (u.FullName != null && u.FullName.ToLower().Contains(keyword)) 
                                      || (u.Email != null && u.Email.ToLower().Contains(keyword)) 
                                      || (u.PhoneNumber != null && u.PhoneNumber.Contains(keyword)));
            }

            if (!string.IsNullOrEmpty(filter.Role) && Enum.TryParse<GiupViecAPI.Model.Enums.UserRoles>(filter.Role, true, out var roleEnum))
            {
                query = query.Where(u => u.Role == roleEnum);
            }

            return await GetPagedResultAsync<User, UserResponseDTO>(query, filter);
        }

        private async Task<GiupViecAPI.Model.DTO.Shared.PagedResult<TResult>> GetPagedResultAsync<TEntity, TResult>(IQueryable<TEntity> query, BaseFilterDTO filter)
        {
            if (!string.IsNullOrEmpty(filter.SortBy))
            {
                try
                {
                    query = query.OrderBy($"{filter.SortBy} {(filter.IsDescending ? "desc" : "asc")}");
                }
                catch {}
            }

            var totalCount = await query.CountAsync();

            var items = await query
                .Skip((filter.PageIndex - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            var resultItems = _mapper.Map<IEnumerable<TResult>>(items);

            return new GiupViecAPI.Model.DTO.Shared.PagedResult<TResult>
            {
                Items = resultItems,
                TotalCount = totalCount,
                PageIndex = filter.PageIndex,
                PageSize = filter.PageSize
            };
        }

        // 4. LẤY CHI TIẾT USER
        public async Task<UserResponseDTO?> GetByIdAsync(int id)
        {
            var user = await _db.Users.FindAsync(id);
            if (user == null) return null;
            return _mapper.Map<UserResponseDTO>(user);
        }

        // 5. CẬP NHẬT USER (Bổ sung thêm cho đầy đủ)
        public async Task<UserResponseDTO?> UpdateAsync(int id, UserUpdateDTO dto)
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