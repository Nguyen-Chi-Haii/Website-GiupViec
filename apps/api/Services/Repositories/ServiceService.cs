using AutoMapper;
using GiupViecAPI.Data;
using GiupViecAPI.Model.Domain;
using GiupViecAPI.Model.DTO.Service;
using GiupViecAPI.Model.DTO.Shared;
using GiupViecAPI.Services.Interface;
using Microsoft.EntityFrameworkCore;
using System.Linq.Dynamic.Core;

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
        public async Task<ServiceResponseDTO?> CreateAsync(ServiceCreateDTO dto)
        {
            // Kiểm tra trùng tên dịch vụ (Optional: tùy nghiệp vụ có cần không)
            bool isExists = await _db.Services.AnyAsync(s => s.Name == dto.Name);
            if (isExists)
            {
                throw new Exception("Tên dịch vụ đã tồn tại, vui lòng chọn tên khác.");
            }
 
            var service = _mapper.Map<Service>(dto);

            // Thêm vào DB
            await _db.Services.AddAsync(service);
            await _db.SaveChangesAsync();

            // Map ngược lại Response để trả về
            return _mapper.Map<ServiceResponseDTO>(service);
        }

        // 2. LẤY TẤT CẢ DỊCH VỤ
        public async Task<GiupViecAPI.Model.DTO.Shared.PagedResult<ServiceResponseDTO>> GetAllAsync(ServiceFilterDTO filter)
        {
            var query = _db.Services.AsQueryable();

            if (!string.IsNullOrEmpty(filter.Keyword))
            {
                var keyword = filter.Keyword.ToLower();
                query = query.Where(s => (s.Name != null && s.Name.ToLower().Contains(keyword)) 
                                      || (s.Description != null && s.Description.ToLower().Contains(keyword)));
            }
            
            if (filter.MinPrice.HasValue)
                query = query.Where(s => s.Price >= filter.MinPrice.Value);

             if (filter.MaxPrice.HasValue)
                query = query.Where(s => s.Price <= filter.MaxPrice.Value);

            return await GetPagedResultAsync<Service, ServiceResponseDTO>(query, filter);
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

        // 3. LẤY DỊCH VỤ THEO ID
        public async Task<ServiceResponseDTO?> GetByIdAsync(int id)
        {
            var service = await _db.Services.FindAsync(id);
 
            if (service == null) return null;
 
            return _mapper.Map<ServiceResponseDTO>(service);
        }
 
        // 4. CẬP NHẬT DỊCH VỤ
        public async Task<ServiceResponseDTO?> UpdateAsync(int id, ServiceUpdateDTO dto)
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
            _mapper.Map(dto, existingService);

            await _db.SaveChangesAsync();

            return _mapper.Map<ServiceResponseDTO>(existingService);
        }

        // 5. LẤY DANH SÁCH NHÃN ĐƠN VỊ (Gợi ý cho dropdown)
        public async Task<IEnumerable<string>> GetUnitLabelsAsync()
        {
            return await _db.Services
                .Where(s => !string.IsNullOrEmpty(s.UnitLabel))
                .Select(s => s.UnitLabel ?? "")
                .Distinct()
                .ToListAsync();
        }
    }
}