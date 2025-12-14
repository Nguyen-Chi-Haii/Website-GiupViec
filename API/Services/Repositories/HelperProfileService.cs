using AutoMapper;
using GiupViecAPI.Data;
using GiupViecAPI.Model.Domain;
using GiupViecAPI.Model.DTO.HelperProfile;
using GiupViecAPI.Model.Enums;
using GiupViecAPI.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace GiupViecAPI.Services.Repositories
{
    public class HelperProfileService : IHelperProfileService
    {
        private readonly GiupViecDBContext _db;
        private readonly IMapper _mapper;

        public HelperProfileService(GiupViecDBContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        public async Task<HelperProfileResponseDTO> GetByUserIdAsync(int userId)
        {
            // Include User để lấy tên map sang DTO
            var profile = await _db.HelperProfiles
                .Include(x => x.User)
                .FirstOrDefaultAsync(x => x.UserId == userId);

            if (profile == null) return null;

            return _mapper.Map<HelperProfileResponseDTO>(profile);
        }

        public async Task<HelperProfileResponseDTO> CreateAsync(HelperProfileCreateDTO dto)
        {
            // 1. Tìm User trong DB để kiểm tra Role
            var user = await _db.Users.FindAsync(dto.UserId);

            if (user == null)
            {
                throw new Exception("Không tìm thấy người dùng.");
            }

            // --- ĐOẠN CODE CẦN THÊM ---
            // 2. Kiểm tra Role: Nếu không phải Helper (Enum số 3) thì chặn lại ngay
            if (user.Role != UserRoles.Helper)
            {
                throw new Exception("Lỗi: Chỉ tài khoản có quyền 'Helper' mới được tạo hồ sơ giúp việc.");
            }
            // ---------------------------

            // 3. Kiểm tra xem User này đã có hồ sơ chưa (Tránh trùng lặp)
            var existingProfile = await _db.HelperProfiles.AnyAsync(x => x.UserId == dto.UserId);
            if (existingProfile)
            {
                throw new Exception("User này đã có hồ sơ giúp việc rồi.");
            }

            // ... (Các đoạn map và lưu DB phía sau giữ nguyên) ...
            var profile = _mapper.Map<HelperProfile>(dto);
            _db.HelperProfiles.Add(profile);
            await _db.SaveChangesAsync();

            await _db.Entry(profile).Reference(x => x.User).LoadAsync();
            return _mapper.Map<HelperProfileResponseDTO>(profile);
        }

        public async Task<HelperProfileResponseDTO> UpdateAsync(int userId, HelperProfileUpdateDTO dto)
        {
            var profile = await _db.HelperProfiles
                .Include(x => x.User)
                .FirstOrDefaultAsync(x => x.UserId == userId);

            if (profile == null) return null;

            _mapper.Map(dto, profile);
            await _db.SaveChangesAsync();

            return _mapper.Map<HelperProfileResponseDTO>(profile);
        }
    }
}