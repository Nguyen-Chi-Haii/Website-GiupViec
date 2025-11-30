using AutoMapper;
using GiupViecAPI.Model.Domain;
using GiupViecAPI.Model.DTO.Service;
using GiupViecAPI.Model.DTO.User;

namespace GiupViecAPI.Mapping
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // User Mappings
            CreateMap<UserCreateDTO, User>();
            CreateMap<UserUpdateDTO, User>();
            CreateMap<User, UserResponseDTO>();
            // Service Mappings
            CreateMap<ServiceCreateDTO, Service>();
            CreateMap<ServiceUpdateDTO, Service>();
            CreateMap<Service, ServiceResponseDTO>();
        }
    }
}
