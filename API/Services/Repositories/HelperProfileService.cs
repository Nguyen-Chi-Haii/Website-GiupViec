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
    }
}