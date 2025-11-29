using AutoMapper;
using GiupViecAPI.Model.Domain;
using GiupViecAPI.Model.DTO.User;

namespace GiupViecAPI.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<UserCreateDTO, User>();
            CreateMap<UserUpdateDTO, User>();
            CreateMap<User, UserResponseDTO>();
        }
    }
}
