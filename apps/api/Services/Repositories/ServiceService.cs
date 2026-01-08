using AutoMapper;
using GiupViecAPI.Data;
using GiupViecAPI.Model.Domain;
using GiupViecAPI.Model.DTO.Service;
using GiupViecAPI.Services.Interface;
using Microsoft.EntityFrameworkCore;

namespace GiupViecAPI.Services.Repositories
{
    public class ServiceService : IServiceService
    {
        private readonly GiupViecDBContext _db;
        private readonly IMapper _mapper;

        public ServiceService(GiupViecDBContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        // 1. TẠO DỊCH VỤ MỚI
        public async Task<ServiceResponseDTO> CreateAsync(ServiceCreateDTO dto)
        {
            // Kiểm tra trùng tên dịch vụ (Optional: tùy nghiệp vụ có cần không)
            bool isExists = await _db.Services.AnyAsync(s => s.Name == dto.Name);
            if (isExists)
            {
                throw new Exception("Tên dịch vụ đã tồn tại, vui lòng chọn tên khác.");
            }

            // Map từ DTO sang Entity
            var service = _mapper.Map<Service>(dto);

            // Thêm vào DB
            await _db.Services.AddAsync(service);
            await _db.SaveChangesAsync();

            // Map ngược lại Response để trả về
            return _mapper.Map<ServiceResponseDTO>(service);
        }

        // 2. LẤY TẤT CẢ DỊCH VỤ
        public async Task<IEnumerable<ServiceResponseDTO>> GetAllAsync()
        {
            var list = await _db.Services
                .OrderBy(s => s.Price) // Sắp xếp theo giá tăng dần (hoặc theo tên)
                .ToListAsync();

            return _mapper.Map<IEnumerable<ServiceResponseDTO>>(list);
        }

        // 3. LẤY DỊCH VỤ THEO ID
        public async Task<ServiceResponseDTO> GetByIdAsync(int id)
        {
            var service = await _db.Services.FindAsync(id);

            if (service == null) return null;

            return _mapper.Map<ServiceResponseDTO>(service);
        }

        // 4. CẬP NHẬT DỊCH VỤ
        public async Task<ServiceResponseDTO> UpdateAsync(int id, ServiceUpdateDTO dto)
        {
            var existingService = await _db.Services.FindAsync(id);

            if (existingService == null) return null;

            // Kiểm tra trùng tên nếu người dùng thay đổi tên
            if (!string.IsNullOrEmpty(dto.Name) && dto.Name != existingService.Name)
            {
                bool isDuplicate = await _db.Services.AnyAsync(s => s.Name == dto.Name);
                if (isDuplicate) throw new Exception("Tên dịch vụ mới bị trùng với dịch vụ đã có.");
            }

            // AutoMapper sẽ tự động lấy dữ liệu từ DTO đè vào Entity cũ
            // Những trường nào trong DTO là null thì AutoMapper có thể cấu hình bỏ qua hoặc đè null tùy profile,
            // nhưng logic cơ bản là map đè thuộc tính.
            _mapper.Map(dto, existingService);

            // Cập nhật ngày sửa (nếu Model có trường UpdatedAt, còn không thì bỏ qua)
            // existingService.UpdatedAt = DateTime.UtcNow; 

            await _db.SaveChangesAsync();

            return _mapper.Map<ServiceResponseDTO>(existingService);
        }

        // 5. LẤY DANH SÁCH NHÃN ĐƠN VỊ (Gợi ý cho dropdown)
        public async Task<IEnumerable<string>> GetUnitLabelsAsync()
        {
            return await _db.Services
                .Where(s => !string.IsNullOrEmpty(s.UnitLabel))
                .Select(s => s.UnitLabel)
                .Distinct()
                .ToListAsync();
        }
    }
}