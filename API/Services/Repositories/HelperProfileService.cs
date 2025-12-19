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

        public Task<HelperProfileResponseDTO> CreateAsync(HelperProfileCreateDTO dto)
        {
            throw new NotImplementedException();
        }

        public Task<HelperProfileResponseDTO> GetByUserIdAsync(int userId)
        {
            throw new NotImplementedException();
        }

        public Task<HelperProfileResponseDTO> UpdateAsync(int userId, HelperProfileUpdateDTO dto)
        {
            throw new NotImplementedException();
        }
    }
}