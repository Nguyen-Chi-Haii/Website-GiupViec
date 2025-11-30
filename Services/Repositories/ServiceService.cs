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

        public async Task<IEnumerable<ServiceResponseDTO>> GetAllAsync()
        {
            var services = await _db.Services.ToListAsync();
            return _mapper.Map<IEnumerable<ServiceResponseDTO>>(services);
        }

        public async Task<ServiceResponseDTO> GetByIdAsync(int id)
        {
            var service = await _db.Services.FindAsync(id);
            if (service == null) return null;

            return _mapper.Map<ServiceResponseDTO>(service);
        }

        public async Task<ServiceResponseDTO> CreateAsync(ServiceCreateDTO dto)
        {
            var service = _mapper.Map<Service>(dto);

            _db.Services.Add(service);
            await _db.SaveChangesAsync();

            return _mapper.Map<ServiceResponseDTO>(service);
        }

        public async Task<ServiceResponseDTO> UpdateAsync(int id, ServiceUpdateDTO dto)
        {
            var service = await _db.Services.FindAsync(id);
            if (service == null) return null;

            // Map dữ liệu từ DTO vào Entity cũ
            _mapper.Map(dto, service);

            await _db.SaveChangesAsync();

            return _mapper.Map<ServiceResponseDTO>(service);
        }
    }
}