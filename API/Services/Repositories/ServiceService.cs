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

        public Task<ServiceResponseDTO> CreateAsync(ServiceCreateDTO dto)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<ServiceResponseDTO>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public Task<ServiceResponseDTO> GetByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceResponseDTO> UpdateAsync(int id, ServiceUpdateDTO dto)
        {
            throw new NotImplementedException();
        }
    }
}