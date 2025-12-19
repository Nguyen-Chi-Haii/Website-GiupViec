using AutoMapper;
using GiupViecAPI.Data;
using GiupViecAPI.Model.Domain;
using GiupViecAPI.Model.DTO.Auth;
using GiupViecAPI.Model.DTO.User;
using GiupViecAPI.Model.Enums;
using GiupViecAPI.Services.Interface;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
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

        public Task<UserResponseDTO> CreateAsync(UserCreateDTO DTO)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<UserResponseDTO>> GetAllAsync()
        {
            throw new NotImplementedException();
        }

        public Task<UserResponseDTO> GetByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

        public Task<string> LoginAsync(LoginDTO loginDto)
        {
            throw new NotImplementedException();
        }

        public Task<UserResponseDTO> UpdateAsync(int id, UserUpdateDTO DTO)
        {
            throw new NotImplementedException();
        }
    }
}
