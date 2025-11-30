using AutoMapper;
using GiupViecAPI.Model.Domain;
using GiupViecAPI.Model.DTO.HelperProfile;
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
            // HelperProfile Mappings
            CreateMap<HelperProfileCreateDTO, HelperProfile>();
            CreateMap<HelperProfileUpdateDTO, HelperProfile>();

            CreateMap<HelperProfile, HelperProfileResponseDTO>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.FullName));
        }
    }
}
