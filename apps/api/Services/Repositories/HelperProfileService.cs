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

        public async Task<HelperProfileResponseDTO> CreateAsync(HelperProfileCreateDTO dto)
        {
            // Bước 1: Kiểm tra xem User này đã có hồ sơ chưa (Mỗi người chỉ 1 hồ sơ)
            var existingProfile = await _db.HelperProfiles
                .FirstOrDefaultAsync(x => x.UserId == dto.UserId);

            if (existingProfile != null)
            {
                throw new Exception("Người dùng này đã có hồ sơ giúp việc, không thể tạo thêm.");
            }

            // Bước 2: Kiểm tra User có tồn tại không (Optional vì FK lo rồi, nhưng check để báo lỗi rõ hơn)
            var user = await _db.Users.FindAsync(dto.UserId);
            if (user == null) throw new Exception("Không tìm thấy người dùng.");

            // Bước 3: Map DTO sang Entity
            var newProfile = _mapper.Map<HelperProfile>(dto);

            // Set giá trị mặc định nếu cần
            newProfile.RatingAverage = 0;

            // Bước 4: Lưu vào DB
            await _db.HelperProfiles.AddAsync(newProfile);
            await _db.SaveChangesAsync();

            // Bước 5: Map ngược lại sang ResponseDTO để trả về
            return _mapper.Map<HelperProfileResponseDTO>(newProfile);
        }

        // Admin creates helper with user data in one go
        public async Task<HelperProfileResponseDTO> CreateHelperWithUserAsync(AdminHelperCreateDTO dto)
        {
            // Bước 1: Kiểm tra email đã tồn tại chưa
            if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
            {
                throw new Exception("Email này đã được sử dụng.");
            }

            // Bước 2: Tạo User entity
            var user = new User
            {
                UserName = dto.Email, // IdentityUser requires UserName
                Email = dto.Email,
                NormalizedEmail = dto.Email.ToUpper(),
                NormalizedUserName = dto.Email.ToUpper(),
                PhoneNumber = dto.Phone, // IdentityUser uses PhoneNumber, not Phone
                SecurityStamp = Guid.NewGuid().ToString(), // Required by IdentityUser
                FullName = dto.FullName,
                Avatar = dto.Avatar ?? "",
                Address = dto.Address ?? "",
                Role = Model.Enums.UserRoles.Helper, // Always Helper role
                Status = Model.Enums.UserStatus.Active, // Default to Active
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Băm mật khẩu
            var passwordHasher = new Microsoft.AspNetCore.Identity.PasswordHasher<User>();
            user.PasswordHash = passwordHasher.HashPassword(user, dto.Password);

            // Bước 3: Lưu User vào DB
            await _db.Users.AddAsync(user);
            await _db.SaveChangesAsync(); // Save để có user.Id

            // Bước 4: Tạo HelperProfile liên kết với User vừa tạo
            var helperProfile = new HelperProfile
            {
                UserId = user.Id,
                ActiveArea = dto.ActiveArea,
                Bio = dto.Bio ?? "",
                CareerStartDate = DateTime.UtcNow.AddYears(-dto.ExperienceYears), // Calculate from experience years
                RatingAverage = 0,
                HourlyRate = dto.HourlyRate ?? 0
            };

            await _db.HelperProfiles.AddAsync(helperProfile);
            await _db.SaveChangesAsync();

            // Bước 5: Load lại profile với User để map đầy đủ
            var createdProfile = await _db.HelperProfiles
                .Include(h => h.User)
                .FirstOrDefaultAsync(h => h.Id == helperProfile.Id);

            return _mapper.Map<HelperProfileResponseDTO>(createdProfile);
        }

        // 2. Logic lấy hồ sơ theo UserId
        public async Task<HelperProfileResponseDTO> GetByUserIdAsync(int userId)
        {
            var profile = await _db.HelperProfiles
                .Include(h => h.User) // Join bảng User nếu cần lấy tên/email
                .FirstOrDefaultAsync(x => x.UserId == userId);

            if (profile == null) return null;

            return _mapper.Map<HelperProfileResponseDTO>(profile);
        }

        // 3. Logic cập nhật hồ sơ
        public async Task<HelperProfileResponseDTO> UpdateAsync(int userId, HelperProfileUpdateDTO dto)
        {
            // Tìm hồ sơ cũ
            var existingProfile = await _db.HelperProfiles
                .Include(h => h.User)
                .FirstOrDefaultAsync(x => x.UserId == userId);

            if (existingProfile == null) return null;

            // Map dữ liệu mới đè lên dữ liệu cũ (AutoMapper sẽ tự khớp các trường trùng tên)
            _mapper.Map(dto, existingProfile);

            // Lưu thay đổi
            await _db.SaveChangesAsync();

            return _mapper.Map<HelperProfileResponseDTO>(existingProfile);
        }
        public async Task<IEnumerable<HelperSuggestionDTO>> GetAvailableHelpersAsync(AvailableHelperFilterDTO filter)
        {
            // BƯỚC 1: Tìm danh sách ID của những Helper ĐANG BẬN trong khung giờ này
            var busyHelperIds = await _db.Bookings
                .Where(b =>
                    b.HelperId != null && // Chỉ xét đơn đã có người nhận
                    b.Status != BookingStatus.Cancelled &&
                    b.Status != BookingStatus.Completed &&
                    // Logic trùng lịch:
                    // (StartA <= EndB) và (EndA >= StartB) -> Trùng ngày
                    b.StartDate <= filter.EndDate && b.EndDate >= filter.StartDate &&
                    // (ShiftStartA < ShiftEndB) và (ShiftEndA > ShiftStartB) -> Trùng giờ
                    b.WorkShiftStart < filter.WorkShiftEnd && b.WorkShiftEnd > filter.WorkShiftStart
                )
                .Select(b => b.HelperId.Value) // Lấy ra List ID
                .Distinct()
                .ToListAsync();

            // BƯỚC 2: Lấy thông tin các Helper KHÔNG nằm trong danh sách bận
            var availableHelpers = await _db.HelperProfiles
                .Include(h => h.User) // Nhớ Include User để lấy tên/avatar
                .Where(h => !busyHelperIds.Contains(h.UserId)) // Điều kiện quan trọng nhất: ID không nằm trong list bận
                .ToListAsync();

            // BƯỚC 3: Map sang DTO để trả về
            return _mapper.Map<IEnumerable<HelperSuggestionDTO>>(availableHelpers);
        }

        public async Task<IEnumerable<HelperProfileResponseDTO>> GetAllAsync()
        {
            var profiles = await _db.HelperProfiles
                .Include(h => h.User)
                .AsNoTracking()
                .ToListAsync();

            return _mapper.Map<IEnumerable<HelperProfileResponseDTO>>(profiles);
        }

        public async Task<bool> SoftDeleteAsync(int id)
        {
            var profile = await _db.HelperProfiles
                .Include(h => h.User)
                .FirstOrDefaultAsync(h => h.Id == id);
                
            if (profile == null) return false;

            var user = profile.User;

            // Xóa cả Profile và User (Vì admin tạo Helper thường là tạo cặp này)
            _db.HelperProfiles.Remove(profile);
            if (user != null)
            {
                _db.Users.Remove(user);
            }

            await _db.SaveChangesAsync();
            return true;
        }
    }
}